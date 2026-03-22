# 悬浮球问答助手

桌面悬浮球形态的 AI 问答助手，支持 Qwen 线上 API 和本地 Ollama。

## 运行方式

```bash
npm install electron
npx electron .
```

## 功能

- **悬浮球特效**：鼠标接近时旋转和波纹
- **问答对话**：输入内容回车后显示「用户」提问，下方显示「助手」回复（流式输出）
- **模型选择**：
  - **qwen**：调用阿里云 DashScope 线上 API
  - **ollama**：使用本地 Ollama 的 qwen3:4b 模型

## 配置

### Qwen 线上 API

首次使用请复制 `config.example.json` 为 `config.json`，并填写你的 API Key：

```json
{
  "qwenApiKey": "你的DashScope-API-Key"
}
```

也可设置环境变量 `DASHSCOPE_API_KEY`。

### Ollama 本地模型

1. 安装并启动 [Ollama](https://ollama.com/)
2. 拉取模型：`ollama pull qwen3:4b`
3. 确保 Ollama 服务运行在 `http://localhost:11434`
