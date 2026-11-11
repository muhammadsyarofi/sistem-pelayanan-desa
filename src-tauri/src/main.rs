#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("Gagal menjalankan aplikasi desktop SimpelDesa Luwung");
}
