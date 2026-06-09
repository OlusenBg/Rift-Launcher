use serde::Serialize;

#[derive(Serialize)]
pub struct UpdateInfo {
    pub version: String,
    pub release_url: String,
}

#[derive(serde::Deserialize)]
struct GhRelease {
    tag_name: String,
    html_url: String,
}

fn is_newer(latest: &str, current: &str) -> bool {
    fn parse(v: &str) -> (u64, u64, u64) {
        let v = v.trim_start_matches('v');
        let mut p = v.splitn(3, '.').map(|s| s.parse::<u64>().unwrap_or(0));
        (p.next().unwrap_or(0), p.next().unwrap_or(0), p.next().unwrap_or(0))
    }
    parse(latest) > parse(current)
}

#[tauri::command]
pub async fn check_for_update() -> Result<Option<UpdateInfo>, String> {
    let current = env!("CARGO_PKG_VERSION");
    let release: GhRelease = reqwest::Client::new()
        .get("https://api.github.com/repos/OlusenBg/Rift-Launcher/releases/latest")
        .header("User-Agent", "rift-launcher-updater")
        .send()
        .await
        .map_err(|_| "update check failed".to_string())?
        .json()
        .await
        .map_err(|_| "update check failed".to_string())?;
    if is_newer(release.tag_name.trim_start_matches('v'), current) {
        Ok(Some(UpdateInfo {
            version: release.tag_name.trim_start_matches('v').to_string(),
            release_url: release.html_url,
        }))
    } else {
        Ok(None)
    }
}
