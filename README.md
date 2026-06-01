# MiMo Voice Studio

基于 Tauri v2 桌面应用（React + TypeScript 前端，Rust 后端）的 AI 文本转语音合成工具，通过 MiMo API 实现。

## 功能特性

- **预设语音**：使用内置语音库进行语音合成
- **语音设计**：通过文本描述自定义语音风格
- **语音克隆**：上传音频样本来克隆语音

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript 5.8 |
| 构建工具 | Vite 7 |
| UI 组件库 | MUI v9 (Material UI) + Emotion |
| 桌面框架 | Tauri v2 (Rust) |
| HTTP 客户端 (Rust) | reqwest 0.12 |
| 异步运行时 (Rust) | tokio |

## 开发环境

### 推荐 IDE 设置

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

### 前置要求

- Node.js
- pnpm
- Rust 工具链（rustup）

## 常用命令

```bash
# 安装前端依赖
pnpm install

# 启动前端开发服务器（仅浏览器模式，无需 Tauri）
pnpm dev

# 启动 Tauri 桌面应用开发模式（需要 Rust 工具链）
pnpm tauri dev

# 构建前端
pnpm build

# 构建 Tauri 桌面应用二进制文件
pnpm tauri build

# TypeScript 类型检查
pnpm exec tsc --noEmit
```

## 项目结构

```
├── src/                  # 前端源码
│   ├── api/              # MiMo API 调用层
│   ├── components/       # React 组件
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数（音频转码等）
│   └── App.tsx           # 应用入口
├── src-tauri/            # Rust 后端源码
│   ├── main.rs           # Tauri 入口
│   ├── lib.rs            # Tauri 命令定义
│   └── mimo.rs           # MiMo API Rust 客户端
├── public/               # 静态资源
└── package.json
```

## API 密钥配置

- **浏览器模式**：通过 `localStorage` 存储 `mimo_api_key` / `mimo_base_url`
- **Tauri 模式**：应用内存中保存（重启后重置）

## 主题

支持深色/浅色模式切换，通过 `ThemeContext` 实现。深色主题主色调为 `#7c4dff`，浅色主题为 `#651fff`。
