/**
 * Convert an audio DataURL (any browser-supported format) to WAV DataURL.
 * Uses Web Audio API to decode, then encodes as 16-bit PCM WAV.
 * Falls back to original DataURL if decoding fails.
 */
export async function toWavDataURL(dataUrl: string): Promise<string> {
  try {
    // Strip the base64 data from the DataURL
    const base64 = dataUrl.split(',')[1];
    if (!base64) return dataUrl;

    const raw = base64ToArrayBuffer(base64);
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(raw);
    await audioCtx.close();

    const wavBuffer = audioBufferToWav(audioBuffer);
    const wavBase64 = arrayBufferToBase64(wavBuffer);
    return `data:audio/wav;base64,${wavBase64}`;
  } catch {
    // If decoding fails, return the original DataURL
    return dataUrl;
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2; // 16-bit samples
  const headerLength = 44;
  const totalLength = headerLength + length;

  const wav = new ArrayBuffer(totalLength);
  const view = new DataView(wav);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
  view.setUint16(32, numChannels * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Interleave and write samples
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return wav;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
