mod auth;
mod minecraft;
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
            minecraft::launch_instance,
            minecraft::stop_instance,
            minecraft::get_running_instances,
            minecraft::get_minecraft_versions,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
