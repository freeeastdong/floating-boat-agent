# 悬浮球问答助手

桌面悬浮球形态的 AI 问答助手，支持 Qwen 线上 API 和本地 Ollama，以及视觉模型。

## 运行方式

```bash
npm install electron
npx electron .
```

## 功能

- **悬浮球特效**：鼠标接近时旋转和波纹
- **问答对话**：输入内容回车后显示「用户」提问，下方显示「助手」回复（流式输出）
- **模式切换**：球体右上角「文」图标为文本模型模式，左上角「图」图标为视觉模型模式
- **模型选择**：
  - **文本模式**：qwen（阿里云）、ollama（qwen3:4b）
  - **视觉模式**：qwen3-VL:8B（Ollama 视觉模型）
- **视觉模式图片上传**：将图片拖拽到球体中即可

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
2. 文本模型：`ollama pull qwen3:4b`
3. 视觉模型：`ollama pull qwen3-vl:8b`
4. 确保 Ollama 服务运行在 `http://localhost:11434`

## 最近更新

- 新增视觉模型支持，接入 Ollama qwen3-vl:8b 模型
- 球体右上角「文」、左上角「图」双图标，可切换文本/视觉模式
- 文本模式：下拉框显示 qwen、ollama；视觉模式：显示 qwen3-VL:8B
- 视觉模式下支持将图片拖拽到球体上传
