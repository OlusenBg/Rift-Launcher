use std::io::{Read, Write};
use std::net::TcpListener;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use rand::Rng;
use serde::{Deserialize, Serialize};

// ── Session file path ─────────────────────────────────────────────────────────

fn session_path() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_default()
        .join("dev.modrift.launcher")
        .join("session.json")
}

// ── Persisted session ─────────────────────────────────────────────────────────

#[derive(Serialize, Deserialize, Clone)]
struct Session {
    launcher_api_key: String,
    ms_access_token: String,
    ms_refresh_token: String,
    ms_token_expires_at: u64,
    minecraft_token: String,
    minecraft_token_expires_at: u64,
    minecraft_uuid: String,
    minecraft_username: String,
}

fn load_session() -> Option<Session> {
    let path = session_path();
    let data = std::fs::read_to_string(path).ok()?;
    serde_json::from_str(&data).ok()
}

fn save_session(session: &Session) -> Result<(), String> {
    let path = session_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let data = serde_json::to_string(session).map_err(|e| e.to_string())?;
    std::fs::write(path, data).map_err(|e| e.to_string())
}

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

// ── Public return types ───────────────────────────────────────────────────────

#[derive(Serialize, Deserialize)]
pub struct MinecraftProfile {
    pub uuid: String,
    pub username: String,
    pub minecraft_token: String,
}

#[derive(Serialize, Deserialize)]
pub struct SessionInfo {
    pub minecraft_uuid: String,
    pub minecraft_username: String,
    pub launcher_api_key: String,
}

// ── Exchange response from modrift.dev ────────────────────────────────────────

#[derive(Deserialize)]
struct ExchangeResponse {
    launcher_api_key: String,
    ms_access_token: String,
    ms_refresh_token: String,
    ms_token_expires_at: u64,
}

// ── Minecraft auth chain structs ──────────────────────────────────────────────

#[derive(Deserialize)]
struct XboxAuthResponse {
    #[serde(rename = "Token")]
    token: String,
    #[serde(rename = "DisplayClaims")]
    display_claims: XboxDisplayClaims,
}

#[derive(Deserialize)]
struct XboxDisplayClaims {
    xui: Vec<XboxXui>,
}

#[derive(Deserialize)]
struct XboxXui {
    uhs: String,
}

#[derive(Deserialize)]
struct MinecraftAuthResponse {
    access_token: String,
    expires_in: u64,
}

#[derive(Deserialize)]
struct MinecraftProfileResponse {
    id: String,
    name: String,
}

// ── Refresh response from modrift.dev ─────────────────────────────────────────

#[derive(Deserialize)]
struct RefreshResponse {
    ms_access_token: String,
    ms_refresh_token: String,
    ms_token_expires_at: u64,
}

// ── Minecraft auth chain ──────────────────────────────────────────────────────

async fn do_minecraft_auth(ms_access_token: &str) -> Result<(String, u64, String, String), String> {
    let client = reqwest::Client::new();

    // Step A: Xbox Live
    let xbl_body = serde_json::json!({
        "Properties": {
            "AuthMethod": "RPS",
            "SiteName": "user.auth.xboxlive.com",
            "RpsTicket": format!("d={}", ms_access_token)
        },
        "RelyingParty": "http://auth.xboxlive.com",
        "TokenType": "JWT"
    });

    let xbl_resp: XboxAuthResponse = client
        .post("https://user.auth.xboxlive.com/user/authenticate")
        .header("Content-Type", "application/json")
        .header("Accept", "application/json")
        .json(&xbl_body)
        .send()
        .await
        .map_err(|e| format!("Xbox Live auth failed: {}", e))?
        .json()
        .await
        .map_err(|e| format!("Xbox Live auth parse failed: {}", e))?;

    let xbl_token = xbl_resp.token;
    let user_hash = xbl_resp
        .display_claims
        .xui
        .into_iter()
        .next()
        .map(|x| x.uhs)
        .ok_or("No uhs in Xbox Live response")?;

    // Step B: XSTS
    let xsts_body = serde_json::json!({
        "Properties": {
            "SandboxId": "RETAIL",
            "UserTokens": [xbl_token]
        },
        "RelyingParty": "rp://api.minecraftservices.com/",
        "TokenType": "JWT"
    });

    let xsts_resp: XboxAuthResponse = client
        .post("https://xsts.auth.xboxlive.com/xsts/authorize")
        .header("Content-Type", "application/json")
        .json(&xsts_body)
        .send()
        .await
        .map_err(|e| format!("XSTS auth failed: {}", e))?
        .json()
        .await
        .map_err(|e| format!("XSTS auth parse failed: {}", e))?;

    let xsts_token = xsts_resp.token;

    // Step C: Minecraft auth
    let mc_body = serde_json::json!({
        "identityToken": format!("XBL3.0 x={};{}", user_hash, xsts_token)
    });

    let mc_resp: MinecraftAuthResponse = client
        .post("https://api.minecraftservices.com/authentication/login_with_xbox")
        .header("Content-Type", "application/json")
        .json(&mc_body)
        .send()
        .await
        .map_err(|e| format!("Minecraft auth failed: {}", e))?
        .json()
        .await
        .map_err(|e| format!("Minecraft auth parse failed: {}", e))?;

    let minecraft_token = mc_resp.access_token;
    let minecraft_token_expires_at = now_secs() + mc_resp.expires_in;

    // Step D: Minecraft profile
    let profile_resp: MinecraftProfileResponse = client
        .get("https://api.minecraftservices.com/minecraft/profile")
        .header("Authorization", format!("Bearer {}", minecraft_token))
        .send()
        .await
        .map_err(|e| format!("Minecraft profile fetch failed: {}", e))?
        .json()
        .await
        .map_err(|e| format!("Minecraft profile parse failed: {}", e))?;

    Ok((
        minecraft_token,
        minecraft_token_expires_at,
        profile_resp.id,
        profile_resp.name,
    ))
}

// ── URL query param helpers ───────────────────────────────────────────────────

fn url_decode(s: &str) -> String {
    let mut result = String::new();
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '%' {
            let h1 = chars.next().unwrap_or('0');
            let h2 = chars.next().unwrap_or('0');
            if let Ok(byte) = u8::from_str_radix(&format!("{}{}", h1, h2), 16) {
                result.push(byte as char);
            }
        } else if c == '+' {
            result.push(' ');
        } else {
            result.push(c);
        }
    }
    result
}

fn parse_query_param(query: &str, key: &str) -> Option<String> {
    for pair in query.split('&') {
        let mut parts = pair.splitn(2, '=');
        let k = parts.next()?;
        let v = parts.next().unwrap_or("");
        if k == key {
            return Some(url_decode(v));
        }
    }
    None
}

// ── Tauri commands ────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn start_auth() -> Result<MinecraftProfile, String> {
    // 1. Bind to a free port
    let listener = TcpListener::bind("127.0.0.1:0").map_err(|e| e.to_string())?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();

    // 2. Generate state
    let state: String = {
        let mut rng = rand::thread_rng();
        (0..32)
            .map(|_| format!("{:x}", rng.gen::<u8>() & 0x0f))
            .collect()
    };

    // 3. Build URL and open browser
    let auth_url = format!(
        "https://modrift.dev/auth/launcher?redirect_uri=http%3A%2F%2Flocalhost%3A{}%2Fcallback&state={}",
        port, state
    );
    open::that(&auth_url).map_err(|e| format!("Failed to open browser: {}", e))?;

    // 4. Accept one connection from the callback
    listener
        .set_nonblocking(false)
        .map_err(|e| e.to_string())?;
    let (mut stream, _) = listener.accept().map_err(|e| e.to_string())?;
    stream
        .set_read_timeout(Some(std::time::Duration::from_secs(120)))
        .map_err(|e| e.to_string())?;

    // 5. Read until end of HTTP headers
    let mut buf = Vec::new();
    let mut tmp = [0u8; 1];
    loop {
        match stream.read(&mut tmp) {
            Ok(0) => break,
            Ok(_) => {
                buf.push(tmp[0]);
                if buf.ends_with(b"\r\n\r\n") {
                    break;
                }
            }
            Err(_) => break,
        }
    }

    // 6. Parse first line for GET /callback?code=...&state=...
    let request_str = String::from_utf8_lossy(&buf);
    let first_line = request_str.lines().next().unwrap_or("");
    // e.g. "GET /callback?code=XXX&state=YYY HTTP/1.1"
    let path_and_query = first_line
        .split_whitespace()
        .nth(1)
        .ok_or("Invalid HTTP request")?;
    let query = path_and_query
        .splitn(2, '?')
        .nth(1)
        .unwrap_or("");

    let code = parse_query_param(query, "code").ok_or("Missing code param")?;
    let returned_state = parse_query_param(query, "state").ok_or("Missing state param")?;

    // 7. Send HTTP 200 response
    let response = b"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nConnection: close\r\n\r\n<html><body><h1>Login successful! You can close this tab.</h1></body></html>";
    let _ = stream.write_all(response);
    drop(stream);
    drop(listener);

    // 8. Verify state
    if returned_state != state {
        return Err("State mismatch — possible CSRF attack".to_string());
    }

    // 9. Exchange code for tokens
    let client = reqwest::Client::new();
    let exchange: ExchangeResponse = client
        .post("https://modrift.dev/api/auth/launcher/exchange")
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({ "code": code }))
        .send()
        .await
        .map_err(|e| format!("Exchange request failed: {}", e))?
        .json()
        .await
        .map_err(|e| format!("Exchange parse failed: {}", e))?;

    // 10. Full Minecraft auth chain
    let (minecraft_token, minecraft_token_expires_at, uuid, username) =
        do_minecraft_auth(&exchange.ms_access_token).await?;

    // 11. Save session
    let session = Session {
        launcher_api_key: exchange.launcher_api_key,
        ms_access_token: exchange.ms_access_token,
        ms_refresh_token: exchange.ms_refresh_token,
        ms_token_expires_at: exchange.ms_token_expires_at,
        minecraft_token: minecraft_token.clone(),
        minecraft_token_expires_at,
        minecraft_uuid: uuid.clone(),
        minecraft_username: username.clone(),
    };
    save_session(&session)?;

    Ok(MinecraftProfile {
        uuid,
        username,
        minecraft_token,
    })
}

#[tauri::command]
pub async fn get_session() -> Result<Option<SessionInfo>, String> {
    Ok(load_session().map(|s| SessionInfo {
        minecraft_uuid: s.minecraft_uuid,
        minecraft_username: s.minecraft_username,
        launcher_api_key: s.launcher_api_key,
    }))
}

#[tauri::command]
pub async fn logout() -> Result<(), String> {
    let path = session_path();
    if path.exists() {
        std::fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn refresh_minecraft_token() -> Result<(), String> {
    let mut session = load_session().ok_or("No session found")?;
    let now = now_secs();

    if now >= session.ms_token_expires_at {
        // MS token expired — refresh via modrift API
        let client = reqwest::Client::new();
        let refresh: RefreshResponse = client
            .post("https://modrift.dev/api/auth/microsoft/refresh")
            .header("Content-Type", "application/json")
            .header(
                "Authorization",
                format!("Bearer {}", session.launcher_api_key),
            )
            .json(&serde_json::json!({ "refresh_token": session.ms_refresh_token }))
            .send()
            .await
            .map_err(|e| format!("Token refresh failed: {}", e))?
            .json()
            .await
            .map_err(|e| format!("Token refresh parse failed: {}", e))?;

        session.ms_access_token = refresh.ms_access_token;
        session.ms_refresh_token = refresh.ms_refresh_token;
        session.ms_token_expires_at = refresh.ms_token_expires_at;
    }

    // Re-run Minecraft auth chain
    let (minecraft_token, minecraft_token_expires_at, uuid, username) =
        do_minecraft_auth(&session.ms_access_token).await?;

    session.minecraft_token = minecraft_token;
    session.minecraft_token_expires_at = minecraft_token_expires_at;
    session.minecraft_uuid = uuid;
    session.minecraft_username = username;

    save_session(&session)
}
