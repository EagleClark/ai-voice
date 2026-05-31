use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
struct MimoRequest {
    model: String,
    messages: Vec<MimoMessage>,
    audio: MimoAudio,
    #[serde(skip_serializing_if = "Option::is_none")]
    stream: Option<bool>,
}

#[derive(Debug, Serialize)]
struct MimoMessage {
    role: String,
    content: String,
}

#[derive(Debug, Serialize)]
struct MimoAudio {
    format: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    voice: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    optimize_text_preview: Option<bool>,
}

#[derive(Debug, Deserialize)]
struct MimoResponse {
    choices: Vec<MimoChoice>,
}

#[derive(Debug, Deserialize)]
struct MimoChoice {
    message: MimoRespMessage,
}

#[derive(Debug, Deserialize)]
struct MimoRespMessage {
    audio: Option<MimoAudioData>,
}

#[derive(Debug, Deserialize)]
struct MimoAudioData {
    data: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynthesisResult {
    pub audio_base64: String,
    pub format: String,
}

pub async fn synthesize(
    api_key: &str,
    base_url: &str,
    model: &str,
    text: &str,
    voice: &str,
    style_instruction: Option<&str>,
    optimize_text: Option<bool>,
    format: &str,
) -> Result<SynthesisResult, String> {
    let mut messages: Vec<MimoMessage> = Vec::new();
    let is_voice_design = model == "mimo-v2.5-tts-voicedesign";
    let is_voice_clone = model == "mimo-v2.5-tts-voiceclone";
    // Preset and voice clone both need audio.voice; only voice design omits it
    let needs_voice = !is_voice_design;

    // For voice design, the voice description goes as a user message
    if is_voice_design && !voice.is_empty() {
        messages.push(MimoMessage {
            role: "user".to_string(),
            content: voice.to_string(),
        });
    }

    if let Some(instruction) = style_instruction {
        if !instruction.is_empty() {
            messages.push(MimoMessage {
                role: "user".to_string(),
                content: instruction.to_string(),
            });
        }
    }

    // Voice clone requires at least one user message; add empty one if missing
    if is_voice_clone && messages.is_empty() {
        messages.push(MimoMessage {
            role: "user".to_string(),
            content: String::new(),
        });
    }

    messages.push(MimoMessage {
        role: "assistant".to_string(),
        content: text.to_string(),
    });

    let audio_voice = if needs_voice && !voice.is_empty() {
        Some(voice.to_string())
    } else {
        None
    };

    let request = MimoRequest {
        model: model.to_string(),
        messages,
        audio: MimoAudio {
            format: format.to_string(),
            voice: audio_voice,
            optimize_text_preview: optimize_text,
        },
        stream: Some(false),
    };

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let endpoint = format!("{}/chat/completions", base_url.trim_end_matches('/'));
    let response = client
        .post(&endpoint)
        .header("api-key", api_key)
        .header("Content-Type", "application/json")
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("API 错误 ({}): {}", status, body));
    }

    let mimo_response: MimoResponse = response
        .json()
        .await
        .map_err(|e| format!("响应解析失败: {}", e))?;

    let audio_data = mimo_response
        .choices
        .first()
        .and_then(|c| c.message.audio.as_ref())
        .ok_or_else(|| "API 未返回音频数据".to_string())?;

    Ok(SynthesisResult {
        audio_base64: audio_data.data.clone(),
        format: format.to_string(),
    })
}
