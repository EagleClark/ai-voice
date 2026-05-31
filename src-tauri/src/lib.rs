mod mimo;

use std::sync::Mutex;
use tauri::State;

struct AppState {
    api_key: Mutex<Option<String>>,
    base_url: Mutex<String>,
}

#[tauri::command]
async fn set_api_key(state: State<'_, AppState>, key: String) -> Result<(), String> {
    let mut api_key = state.api_key.lock().map_err(|e| e.to_string())?;
    *api_key = Some(key);
    Ok(())
}

#[tauri::command]
async fn get_api_key(state: State<'_, AppState>) -> Result<Option<String>, String> {
    let api_key = state.api_key.lock().map_err(|e| e.to_string())?;
    Ok(api_key.clone())
}

#[tauri::command]
async fn set_base_url(state: State<'_, AppState>, url: String) -> Result<(), String> {
    let mut base_url = state.base_url.lock().map_err(|e| e.to_string())?;
    *base_url = url;
    Ok(())
}

#[tauri::command]
async fn get_base_url(state: State<'_, AppState>) -> Result<String, String> {
    let base_url = state.base_url.lock().map_err(|e| e.to_string())?;
    Ok(base_url.clone())
}

#[tauri::command]
async fn synthesize_tts(
    state: State<'_, AppState>,
    model: String,
    text: String,
    voice: String,
    style_instruction: Option<String>,
    optimize_text: Option<bool>,
    format: Option<String>,
) -> Result<mimo::SynthesisResult, String> {
    let (api_key, base_url) = {
        let api_guard = state.api_key.lock().map_err(|e| e.to_string())?;
        let url_guard = state.base_url.lock().map_err(|e| e.to_string())?;
        (
            api_guard
                .clone()
                .ok_or_else(|| "请先设置 API Key".to_string())?,
            url_guard.clone(),
        )
    };

    let format = format.unwrap_or_else(|| "wav".to_string());

    mimo::synthesize(
        &api_key,
        &base_url,
        &model,
        &text,
        &voice,
        style_instruction.as_deref(),
        optimize_text,
        &format,
    )
    .await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            api_key: Mutex::new(None),
            base_url: Mutex::new("https://api.xiaomimimo.com/v1".to_string()),
        })
        .invoke_handler(tauri::generate_handler![
            set_api_key,
            get_api_key,
            set_base_url,
            get_base_url,
            synthesize_tts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
