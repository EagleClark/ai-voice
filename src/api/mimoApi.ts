import type { SynthesisResult, SynthesisParams } from '../types/mimo';

interface Settings {
  apiKey: string;
  baseUrl: string;
}

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

export function loadSettings(): Settings {
  return {
    apiKey: localStorage.getItem('mimo_api_key') || '',
    baseUrl: localStorage.getItem('mimo_base_url') || 'https://api.xiaomimimo.com/v1',
  };
}

export function saveSettings(s: Settings): void {
  localStorage.setItem('mimo_api_key', s.apiKey);
  localStorage.setItem('mimo_base_url', s.baseUrl);
}

async function synthesizeBrowser(params: SynthesisParams, settings: Settings): Promise<SynthesisResult> {
  const messages: { role: string; content: string }[] = [];
  const isVoiceDesign = params.model === 'mimo-v2.5-tts-voicedesign';
  const isVoiceClone = params.model === 'mimo-v2.5-tts-voiceclone';
  // Preset and voice clone both need audio.voice; only voice design omits it
  const needsVoice = !isVoiceDesign;

  // For voice design, the voice description goes as a user message
  if (isVoiceDesign && params.voice) {
    messages.push({ role: 'user', content: params.voice });
  }

  if (params.styleInstruction) {
    messages.push({ role: 'user', content: params.styleInstruction });
  }

  // Voice clone requires at least one user message; add empty one if missing
  if (isVoiceClone && messages.length === 0) {
    messages.push({ role: 'user', content: '' });
  }

  messages.push({ role: 'assistant', content: params.text });

  const body: Record<string, unknown> = {
    model: params.model,
    messages,
    audio: {
      format: params.format || 'wav',
      ...(needsVoice && params.voice ? { voice: params.voice } : {}),
      ...(params.optimizeText !== undefined ? { optimize_text_preview: params.optimizeText } : {}),
    },
    stream: false,
  };

  const response = await fetch(`${settings.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'api-key': settings.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 429) {
      throw new Error('请求过于频繁，请稍等几秒后再试');
    }
    throw new Error(`API 错误 (${response.status}): ${text}`);
  }

  const data = await response.json();
  const audioData = data.choices?.[0]?.message?.audio;
  if (!audioData?.data) throw new Error('API 未返回音频数据');

  return {
    audio_base64: audioData.data,
    format: (params.format || 'wav') as string,
  };
}

async function synthesizeTauri(params: SynthesisParams): Promise<SynthesisResult> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<SynthesisResult>('synthesize_tts', params as unknown as Record<string, unknown>);
}

export async function synthesize(params: SynthesisParams): Promise<SynthesisResult> {
  if (isTauri()) {
    return synthesizeTauri(params);
  }
  const settings = loadSettings();
  if (!settings.apiKey) throw new Error('请先在设置页面配置 API Key');
  return synthesizeBrowser(params, settings);
}

export async function getStoredApiKey(): Promise<string | null> {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke<string | null>('get_api_key');
    } catch {
      return null;
    }
  }
  return localStorage.getItem('mimo_api_key') || null;
}

export async function setStoredApiKey(key: string): Promise<void> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('set_api_key', { key });
    return;
  }
  localStorage.setItem('mimo_api_key', key);
}

export async function getStoredBaseUrl(): Promise<string> {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke<string>('get_base_url');
    } catch {
      return 'https://api.xiaomimimo.com/v1';
    }
  }
  return localStorage.getItem('mimo_base_url') || 'https://api.xiaomimimo.com/v1';
}

export async function setStoredBaseUrl(url: string): Promise<void> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('set_base_url', { url });
    return;
  }
  localStorage.setItem('mimo_base_url', url);
}
