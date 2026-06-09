mod auth;
mod updater;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            auth::start_auth,
            auth::get_session,
            auth::logout,
            auth::refresh_minecraft_token,
            updater::check_for_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
