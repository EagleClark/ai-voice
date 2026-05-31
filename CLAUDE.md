# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MiMo Voice Studio — a Tauri v2 desktop app (React + TypeScript frontend, Rust backend) for AI text-to-speech synthesis via the MiMo API. Supports three synthesis modes: preset voices, voice design (text-prompt-based), and voice cloning (audio sample).

## Commands

```bash
# Frontend dev server (browser-only, no Tauri)
pnpm dev                    # Vite dev on port 1420

# Tauri dev (full desktop app, requires Rust toolchain)
pnpm tauri dev

# Build frontend
pnpm build                  # tsc --noEmit + vite build

# Build Tauri desktop binary
pnpm tauri build

# Check TypeScript
pnpm exec tsc --noEmit
```

## Architecture

### Frontend (`src/`)

- **Entry**: `src/main.tsx` → `src/App.tsx`
- **Pages**: two-slot layout (`components/Layout.tsx`) switching between `MainPage` and `SettingsPage` via local state — no router.
- **State management**: custom hooks (`useTTS`, `useSettings`) and local `useState` in each component. No Redux/context aside from `ThemeContext`.
- **API layer**: `api/mimoApi.ts` has a dual-path design — browser mode calls MiMo API via `fetch` with key from `localStorage`; Tauri mode delegates to Rust via `@tauri-apps/api/core`'s `invoke`. Both paths expose the same interface through `synthesize()`.
- **Key data types** in `types/mimo.ts`: `MimoModel` (union of 3 model strings), `SynthesisParams`, `SynthesisResult`, `PresetVoice[]`, `VoiceDesignExample[]`.
- **Audio utility**: `utils/audioTranscode.ts` — converts any browser-decodable audio to 16-bit PCM WAV using Web Audio API. Used in voice clone mode to preprocess recordings/file uploads before sending.

### Backend (`src-tauri/`)

- `main.rs`: entry point, delegates to `lib.rs`.
- `lib.rs`: defines 5 Tauri commands (`set_api_key`, `get_api_key`, `set_base_url`, `get_base_url`, `synthesize_tts`) with `AppState` holding `Mutex<Option<String>>` for API key and `Mutex<String>` for base URL. Uses Tauri's managed state pattern.
- `mimo.rs`: pure Rust HTTP client for MiMo API using `reqwest`. Mirrors the browser-side API logic (`mimoApi.ts`) — message construction based on model type, 120s timeout, `api-key` header. Both TS and Rust implementations follow the same MiMo Chat Completions API contract.

### Tech Stack

| Layer | Tech |
|-------|------|
| Frontend framework | React 19 + TypeScript 5.8 |
| Bundler | Vite 7 |
| UI library | MUI v9 (Material UI) + Emotion |
| Desktop shell | Tauri v2 (Rust) |
| HTTP client (Rust) | reqwest 0.12 |
| Runtime (Rust) | tokio (async) |

### Theme

Dark/light toggle via `ThemeContext` (React Context). MUI `createTheme` with custom primary (`#7c4dff` dark / `#651fff` light) and dark paper background (`#1a1a24`). No persistence across sessions.

### API Key Storage

- **Browser mode**: `localStorage` keys `mimo_api_key` / `mimo_base_url`
- **Tauri mode**: in-memory `AppState` guarded by `Mutex` (not persisted to disk, resets on app restart)
