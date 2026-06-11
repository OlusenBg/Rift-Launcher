use std::collections::HashMap;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::{Mutex, OnceLock};

use serde::Serialize;
use serde_json::Value;
use tauri::Emitter;

use crate::auth;

const VERSION_MANIFEST: &str = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
const RESOURCES_BASE: &str = "https://resources.download.minecraft.net";
const RIFT_LOADER_META: &str = "https://modrift.dev/api/loader";

// ── Rift Loader profile ─────────────────────────────────────────────────────────────

struct LoaderProfile {
    loader_version: String,
    main_class: String,
    /// (maven path, url, size)
    libraries: Vec<(String, String, Option<u64>)>,
    jvm_args: Vec<String>,
    game_args: Vec<String>,
}

/// Asks modrift.dev for the Rift Loader profile matching this Minecraft
/// version. Returns Ok(None) when no loader build is available (or the meta
/// service is unreachable) so the caller can fall back to vanilla.
async fn fetch_loader_profile(client: &reqwest::Client, mc_version: &str) -> Option<LoaderProfile> {
    let url = format!("{RIFT_LOADER_META}?mc_version={mc_version}");
    let data: Value = client
        .get(&url)
        .timeout(std::time::Duration::from_secs(10))
        .send().await.ok()?
        .error_for_status().ok()?
        .json().await.ok()?;

    if !data["available"].as_bool().unwrap_or(false) {
        return None;
    }

    let libraries = data["libraries"]
        .as_array()?
        .iter()
        .filter_map(|lib| {
            Some((
                lib["path"].as_str()?.to_string(),
                lib["url"].as_str()?.to_string(),
                lib["size"].as_u64().filter(|s| *s > 0),
            ))
        })
        .collect::<Vec<_>>();

    let string_list = |key: &str| -> Vec<String> {
        data[key]
            .as_array()
            .map(|a| a.iter().filter_map(|v| v.as_str().map(String::from)).collect())
            .unwrap_or_default()
    };

    Some(LoaderProfile {
        loader_version: data["loader_version"].as_str()?.to_string(),
        main_class: data["main_class"].as_str()?.to_string(),
        libraries,
        jvm_args: string_list("jvm_args"),
        game_args: string_list("game_args"),
    })
}

// ── Paths ─────────────────────────────────────────────────────────────────────────

fn mc_root() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_default()
        .join("dev.modrift.launcher")
        .join("minecraft")
}

// ── Running process registry ──────────────────────────────────────────────────────

fn running() -> &'static Mutex<HashMap<String, Child>> {
    static MAP: OnceLock<Mutex<HashMap<String, Child>>> = OnceLock::new();
    MAP.get_or_init(|| Mutex::new(HashMap::new()))
}

// ── Events ─────────────────────────────────────────────────────────────────────────

#[derive(Clone, Serialize)]
struct ProgressEvent {
    instance_id: String,
    stage: String,
    pct: u8,
}

#[derive(Clone, Serialize)]
struct StateEvent {
    instance_id: String,
    running: bool,
}

fn emit_progress(app: &tauri::AppHandle, id: &str, stage: &str, pct: u8) {
    let _ = app.emit("launch-progress", ProgressEvent {
        instance_id: id.to_string(),
        stage: stage.to_string(),
        pct,
    });
}

fn emit_state(app: &tauri::AppHandle, id: &str, is_running: bool) {
    let _ = app.emit("instance-state", StateEvent {
        instance_id: id.to_string(),
        running: is_running,
    });
}

// ── OS / rule helpers ───────────────────────────────────────────────────────────────

fn os_name() -> &'static str {
    #[cfg(target_os = "windows")]
    { "windows" }
    #[cfg(target_os = "macos")]
    { "osx" }
    #[cfg(target_os = "linux")]
    { "linux" }
}

fn os_arch() -> &'static str {
    if cfg!(target_arch = "x86") {
        "x86"
    } else if cfg!(target_arch = "aarch64") {
        "arm64"
    } else {
        "x64"
    }
}

/// Mojang rule evaluation: with a rules array present the default is deny,
/// and the last matching rule wins. Feature-gated rules never match
/// (we enable no optional features).
fn rules_allow(rules: &[Value]) -> bool {
    let mut allowed = false;
    for rule in rules {
        let action_allow = rule.get("action").and_then(|a| a.as_str()).unwrap_or("allow") == "allow";
        let mut matches = true;
        if rule.get("features").is_some() {
            matches = false;
        }
        if let Some(os) = rule.get("os") {
            if let Some(name) = os.get("name").and_then(|v| v.as_str()) {
                matches &= name == os_name();
            }
            if let Some(arch) = os.get("arch").and_then(|v| v.as_str()) {
                matches &= arch == os_arch();
            }
        }
        if matches {
            allowed = action_allow;
        }
    }
    allowed
}

// ── Download helpers ─────────────────────────────────────────────────────────────────

async fn download(client: &reqwest::Client, url: &str, dest: &Path, size: Option<u64>) -> Result<(), String> {
    if let Ok(meta) = std::fs::metadata(dest) {
        match size {
            Some(s) if meta.len() == s => return Ok(()),
            None => return Ok(()),
            _ => {}
        }
    }
    if let Some(parent) = dest.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("mkdir failed: {e}"))?;
    }
    let bytes = client
        .get(url)
        .send().await.map_err(|e| format!("download failed ({url}): {e}"))?
        .error_for_status().map_err(|e| format!("download failed ({url}): {e}"))?
        .bytes().await.map_err(|e| format!("download failed ({url}): {e}"))?;
    std::fs::write(dest, &bytes).map_err(|e| format!("write failed: {e}"))
}

async fn fetch_json(client: &reqwest::Client, url: &str) -> Result<Value, String> {
    client
        .get(url)
        .send().await.map_err(|e| format!("request failed ({url}): {e}"))?
        .error_for_status().map_err(|e| format!("request failed ({url}): {e}"))?
        .json().await.map_err(|e| format!("invalid JSON ({url}): {e}"))
}

// ── Natives extraction ────────────────────────────────────────────────────────────────

fn extract_natives(jar: &Path, dest: &Path) -> Result<(), String> {
    std::fs::create_dir_all(dest).map_err(|e| e.to_string())?;
    let file = std::fs::File::open(jar).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| format!("bad natives jar: {e}"))?;
    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).map_err(|e| e.to_string())?;
        let name = entry.name().to_string();
        if entry.is_dir() || name.starts_with("META-INF") {
            continue;
        }
        let Some(fname) = Path::new(&name).file_name() else { continue };
        let out = dest.join(fname);
        if out.exists() {
            continue;
        }
        let mut buf = Vec::with_capacity(entry.size() as usize);
        entry.read_to_end(&mut buf).map_err(|e| e.to_string())?;
        std::fs::write(&out, buf).map_err(|e| e.to_string())?;
    }
    Ok(())
}

// ── Java discovery ─────────────────────────────────────────────────────────────────────

fn java_works(path: &str) -> bool {
    let mut cmd = Command::new(path);
    cmd.arg("-version").stdout(Stdio::null()).stderr(Stdio::null());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }
    cmd.status().map(|s| s.success()).unwrap_or(false)
}

fn find_java() -> Result<String, String> {
    let exe = if cfg!(windows) { "javaw.exe" } else { "java" };
    if let Ok(home) = std::env::var("JAVA_HOME") {
        let candidate = Path::new(&home).join("bin").join(exe);
        let candidate = candidate.to_string_lossy().to_string();
        if java_works(&candidate) {
            return Ok(candidate);
        }
    }
    for candidate in [if cfg!(windows) { "javaw" } else { "java" }, "java"] {
        if java_works(candidate) {
            return Ok(candidate.to_string());
        }
    }
    Err("Java not found. Install Java 21 (Adoptium Temurin recommended) and try again.".to_string())
}

// ── Argument substitution ───────────────────────────────────────────────────────────────

fn substitute(template: &str, vars: &HashMap<&str, String>) -> String {
    let mut out = template.to_string();
    for (key, value) in vars {
        out = out.replace(&format!("${{{key}}}"), value);
    }
    out
}

fn push_argument(list: &mut Vec<String>, element: &Value, vars: &HashMap<&str, String>) {
    match element {
        Value::String(s) => list.push(substitute(s, vars)),
        Value::Object(obj) => {
            if let Some(rules) = obj.get("rules").and_then(|r| r.as_array()) {
                if !rules_allow(rules) {
                    return;
                }
            }
            match obj.get("value") {
                Some(Value::String(s)) => list.push(substitute(s, vars)),
                Some(Value::Array(items)) => {
                    for item in items {
                        if let Some(s) = item.as_str() {
                            list.push(substitute(s, vars));
                        }
                    }
                }
                _ => {}
            }
        }
        _ => {}
    }
}

// ── Tauri commands ───────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn get_minecraft_versions() -> Result<Vec<String>, String> {
    let manifest = fetch_json(&reqwest::Client::new(), VERSION_MANIFEST).await?;
    let versions = manifest["versions"]
        .as_array()
        .map(|list| {
            list.iter()
                .filter(|v| v["type"].as_str() == Some("release"))
                .filter_map(|v| v["id"].as_str().map(String::from))
                .take(50)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    if versions.is_empty() {
        return Err("No versions found".to_string());
    }
    Ok(versions)
}

#[tauri::command]
pub async fn stop_instance(instance_id: String) -> Result<(), String> {
    let mut map = running().lock().map_err(|_| "lock poisoned".to_string())?;
    if let Some(mut child) = map.remove(&instance_id) {
        let _ = child.kill();
        let _ = child.wait();
        Ok(())
    } else {
        Err("Instance is not running".to_string())
    }
}

#[tauri::command]
pub async fn get_running_instances() -> Result<Vec<String>, String> {
    let map = running().lock().map_err(|_| "lock poisoned".to_string())?;
    Ok(map.keys().cloned().collect())
}

#[tauri::command]
pub async fn launch_instance(app: tauri::AppHandle, instance_id: String, version: String) -> Result<(), String> {
    {
        let map = running().lock().map_err(|_| "lock poisoned".to_string())?;
        if map.contains_key(&instance_id) {
            return Err("Instance is already running".to_string());
        }
    }

    let creds = auth::minecraft_credentials().ok_or("Not logged in".to_string())?;
    let java = find_java()?;
    let root = mc_root();
    let client = reqwest::Client::new();

    // 1. Resolve the version JSON (cached on disk after first launch)
    emit_progress(&app, &instance_id, "Fetching version info", 2);
    let version_dir = root.join("versions").join(&version);
    let version_json_path = version_dir.join(format!("{version}.json"));
    let version_data: Value = if version_json_path.exists() {
        let raw = std::fs::read_to_string(&version_json_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&raw).map_err(|e| format!("corrupt version JSON: {e}"))?
    } else {
        let manifest = fetch_json(&client, VERSION_MANIFEST).await?;
        let entry = manifest["versions"]
            .as_array()
            .and_then(|list| list.iter().find(|v| v["id"].as_str() == Some(version.as_str())))
            .ok_or(format!("Unknown Minecraft version {version}"))?;
        let url = entry["url"].as_str().ok_or("missing version URL")?;
        let data = fetch_json(&client, url).await?;
        std::fs::create_dir_all(&version_dir).map_err(|e| e.to_string())?;
        std::fs::write(&version_json_path, serde_json::to_string(&data).unwrap_or_default())
            .map_err(|e| e.to_string())?;
        data
    };

    // 2. Client jar
    emit_progress(&app, &instance_id, "Downloading Minecraft", 8);
    let client_jar = version_dir.join(format!("{version}.jar"));
    if let (Some(url), size) = (
        version_data["downloads"]["client"]["url"].as_str(),
        version_data["downloads"]["client"]["size"].as_u64(),
    ) {
        download(&client, url, &client_jar, size).await?;
    }

    // 3. Rift Loader profile (falls back to vanilla when no build matches)
    emit_progress(&app, &instance_id, "Checking Rift Loader", 9);
    let loader = fetch_loader_profile(&client, &version).await;
    let mut classpath: Vec<PathBuf> = Vec::new();

    if let Some(profile) = &loader {
        let total = profile.libraries.len().max(1);
        for (idx, (path, url, size)) in profile.libraries.iter().enumerate() {
            emit_progress(
                &app,
                &instance_id,
                &format!("Rift Loader {}/{}", idx + 1, total),
                9,
            );
            let dest = root.join("libraries").join(path);
            download(&client, url, &dest, *size).await?;
            classpath.push(dest);
        }
    }

    // 4. Vanilla libraries + natives
    let natives_dir = root.join("natives").join(&version);
    std::fs::create_dir_all(&natives_dir).map_err(|e| e.to_string())?;
    let empty = Vec::new();
    let libraries = version_data["libraries"].as_array().unwrap_or(&empty);
    let total_libs = libraries.len().max(1);

    for (idx, lib) in libraries.iter().enumerate() {
        if let Some(rules) = lib.get("rules").and_then(|r| r.as_array()) {
            if !rules_allow(rules) {
                continue;
            }
        }
        let pct = 10 + ((idx * 25) / total_libs) as u8;
        emit_progress(&app, &instance_id, &format!("Libraries {}/{}", idx + 1, total_libs), pct);

        // Regular artifact → classpath
        if let Some(artifact) = lib.pointer("/downloads/artifact") {
            if let (Some(path), Some(url)) = (artifact["path"].as_str(), artifact["url"].as_str()) {
                let dest = root.join("libraries").join(path);
                download(&client, url, &dest, artifact["size"].as_u64()).await?;
                classpath.push(dest);
            }
        }

        // Legacy natives classifier → download + extract
        if let Some(natives_key) = lib.pointer(&format!("/natives/{}", os_name())).and_then(|v| v.as_str()) {
            let key = natives_key.replace("${arch}", if cfg!(target_pointer_width = "64") { "64" } else { "32" });
            if let Some(classifier) = lib.pointer(&format!("/downloads/classifiers/{key}")) {
                if let (Some(path), Some(url)) = (classifier["path"].as_str(), classifier["url"].as_str()) {
                    let dest = root.join("libraries").join(path);
                    download(&client, url, &dest, classifier["size"].as_u64()).await?;
                    extract_natives(&dest, &natives_dir)?;
                }
            }
        }
    }
    classpath.push(client_jar);

    // 5. Assets
    let assets_index_id = version_data["assets"].as_str().unwrap_or("legacy").to_string();
    let asset_index_path = root.join("assets").join("indexes").join(format!("{assets_index_id}.json"));
    if let (Some(url), size) = (
        version_data["assetIndex"]["url"].as_str(),
        version_data["assetIndex"]["size"].as_u64(),
    ) {
        download(&client, url, &asset_index_path, size).await?;
    }
    let index_raw = std::fs::read_to_string(&asset_index_path).map_err(|e| format!("asset index missing: {e}"))?;
    let asset_index: Value = serde_json::from_str(&index_raw).map_err(|e| format!("corrupt asset index: {e}"))?;

    let objects: Vec<(String, String, u64)> = asset_index["objects"]
        .as_object()
        .map(|map| {
            map.iter()
                .filter_map(|(name, obj)| {
                    let hash = obj["hash"].as_str()?;
                    Some((name.clone(), hash.to_string(), obj["size"].as_u64().unwrap_or(0)))
                })
                .collect()
        })
        .unwrap_or_default();

    let total_assets = objects.len().max(1);
    let mut pending: Vec<(String, u64)> = Vec::new();
    for (_, hash, size) in &objects {
        let dest = root.join("assets").join("objects").join(&hash[..2]).join(hash);
        let exists = std::fs::metadata(&dest).map(|m| m.len() == *size).unwrap_or(false);
        if !exists {
            pending.push((hash.clone(), *size));
        }
    }
    pending.sort();
    pending.dedup();

    let mut done = total_assets - pending.len();
    for chunk in pending.chunks(24) {
        let mut set = tokio::task::JoinSet::new();
        for (hash, size) in chunk {
            let client = client.clone();
            let hash = hash.clone();
            let size = *size;
            let dest = root.join("assets").join("objects").join(&hash[..2]).join(&hash);
            let url = format!("{RESOURCES_BASE}/{}/{}", &hash[..2], hash);
            set.spawn(async move { download(&client, &url, &dest, Some(size)).await });
        }
        while let Some(result) = set.join_next().await {
            result.map_err(|e| e.to_string())??;
            done += 1;
        }
        let pct = 35 + ((done * 55) / total_assets) as u8;
        emit_progress(&app, &instance_id, &format!("Assets {done}/{total_assets}"), pct.min(90));
    }

    // Legacy/virtual assets need real files instead of hashed objects
    let game_dir = root.join("instances").join(&instance_id);
    std::fs::create_dir_all(&game_dir).map_err(|e| e.to_string())?;
    let virtual_assets = asset_index["virtual"].as_bool().unwrap_or(false);
    let map_to_resources = asset_index["map_to_resources"].as_bool().unwrap_or(false);
    let virtual_dir = root.join("assets").join("virtual").join(&assets_index_id);
    if virtual_assets || map_to_resources {
        let target_base = if map_to_resources { game_dir.join("resources") } else { virtual_dir.clone() };
        for (name, hash, _) in &objects {
            let src = root.join("assets").join("objects").join(&hash[..2]).join(hash);
            let dst = target_base.join(name);
            if !dst.exists() {
                if let Some(parent) = dst.parent() {
                    std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
                }
                std::fs::copy(&src, &dst).map_err(|e| e.to_string())?;
            }
        }
    }

    // 6. Build the command line
    let stage = match &loader {
        Some(p) => format!("Starting Rift Loader {}", p.loader_version),
        None => "Starting game (vanilla — Rift Loader not yet available for this version)".to_string(),
    };
    emit_progress(&app, &instance_id, &stage, 95);

    // The loader scans the instance mods folder
    std::fs::create_dir_all(game_dir.join("mods")).map_err(|e| e.to_string())?;
    let sep = if cfg!(windows) { ";" } else { ":" };
    let classpath_str = classpath
        .iter()
        .map(|p| p.to_string_lossy().to_string())
        .collect::<Vec<_>>()
        .join(sep);

    let mut vars: HashMap<&str, String> = HashMap::new();
    vars.insert("auth_player_name", creds.username.clone());
    vars.insert("version_name", version.clone());
    vars.insert("game_directory", game_dir.to_string_lossy().to_string());
    vars.insert("assets_root", root.join("assets").to_string_lossy().to_string());
    vars.insert("assets_index_name", assets_index_id.clone());
    vars.insert("auth_uuid", creds.uuid.clone());
    vars.insert("auth_access_token", creds.token.clone());
    vars.insert("auth_session", format!("token:{}", creds.token));
    vars.insert("auth_xuid", String::new());
    vars.insert("clientid", "rift-launcher".to_string());
    vars.insert("user_type", "msa".to_string());
    vars.insert("user_properties", "{}".to_string());
    vars.insert("version_type", version_data["type"].as_str().unwrap_or("release").to_string());
    vars.insert("natives_directory", natives_dir.to_string_lossy().to_string());
    vars.insert("launcher_name", "rift-launcher".to_string());
    vars.insert("launcher_version", env!("CARGO_PKG_VERSION").to_string());
    vars.insert("classpath", classpath_str.clone());
    vars.insert("game_assets", virtual_dir.to_string_lossy().to_string());
    vars.insert("resolution_width", "854".to_string());
    vars.insert("resolution_height", "480".to_string());

    // Rift Loader overrides the entry point and may inject extra arguments
    let main_class = match &loader {
        Some(profile) => profile.main_class.clone(),
        None => version_data["mainClass"].as_str().ok_or("missing mainClass")?.to_string(),
    };
    let mut jvm_args: Vec<String> = vec!["-Xmx2G".to_string()];
    let mut game_args: Vec<String> = Vec::new();
    if let Some(profile) = &loader {
        jvm_args.extend(profile.jvm_args.iter().map(|a| substitute(a, &vars)));
        game_args.extend(profile.game_args.iter().map(|a| substitute(a, &vars)));
    }

    if let Some(arguments) = version_data.get("arguments") {
        for element in arguments["jvm"].as_array().unwrap_or(&empty) {
            push_argument(&mut jvm_args, element, &vars);
        }
        for element in arguments["game"].as_array().unwrap_or(&empty) {
            push_argument(&mut game_args, element, &vars);
        }
    } else {
        // Legacy format (≤ 1.12.2)
        jvm_args.push(format!("-Djava.library.path={}", natives_dir.to_string_lossy()));
        jvm_args.push("-cp".to_string());
        jvm_args.push(classpath_str.clone());
        if let Some(legacy) = version_data["minecraftArguments"].as_str() {
            for token in legacy.split_whitespace() {
                game_args.push(substitute(token, &vars));
            }
        }
    }

    // 7. Spawn
    let mut command = Command::new(&java);
    command
        .args(&jvm_args)
        .arg(&main_class)
        .args(&game_args)
        .current_dir(&game_dir)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .stdin(Stdio::null());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }
    let child = command.spawn().map_err(|e| format!("Failed to start Java: {e}"))?;

    {
        let mut map = running().lock().map_err(|_| "lock poisoned".to_string())?;
        map.insert(instance_id.clone(), child);
    }
    emit_progress(&app, &instance_id, "Running", 100);
    emit_state(&app, &instance_id, true);

    // 8. Watch for exit on a background thread
    let watch_app = app.clone();
    let watch_id = instance_id.clone();
    std::thread::spawn(move || loop {
        std::thread::sleep(std::time::Duration::from_secs(2));
        let mut map = match running().lock() {
            Ok(m) => m,
            Err(_) => break,
        };
        match map.get_mut(&watch_id) {
            None => break, // stopped via stop_instance
            Some(child) => match child.try_wait() {
                Ok(Some(_)) => {
                    map.remove(&watch_id);
                    drop(map);
                    emit_state(&watch_app, &watch_id, false);
                    break;
                }
                Ok(None) => {}
                Err(_) => {
                    map.remove(&watch_id);
                    drop(map);
                    emit_state(&watch_app, &watch_id, false);
                    break;
                }
            },
        }
    });

    Ok(())
}
