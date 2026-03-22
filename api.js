const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

function getConfig() {
  try {
    const configPath = path.join(__dirname, 'config.json');
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return { qwenApiKey: '' };
  }
}

async function callQwenOnline(messages, onChunk) {
  const config = getConfig();
  const apiKey = config.qwenApiKey || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error('请设置 Qwen API Key：在 config.json 中配置 qwenApiKey，或设置环境变量 DASHSCOPE_API_KEY');
  }

  const body = JSON.stringify({
    model: 'qwen-turbo',
    messages,
    stream: true,
  });

  return new Promise((resolve, reject) => {
    let buffer = '';
    const req = https.request({
      hostname: 'dashscope.aliyuncs.com',
      path: '/compatible-mode/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      if (res.statusCode !== 200) {
        let errData = '';
        res.on('data', c => errData += c);
        res.on('end', () => reject(new Error(`Qwen API 错误 ${res.statusCode}: ${errData}`)));
        return;
      }
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const json = line.slice(6);
            if (json === '[DONE]') continue;
            try {
              const obj = JSON.parse(json);
              const content = obj.choices?.[0]?.delta?.content;
              if (content != null && typeof content === 'string') onChunk(content);
            } catch {}
          }
        }
      });
      res.on('end', () => resolve());
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function callOllamaLocal(messages, onChunk) {
  const body = JSON.stringify({
    model: 'qwen3:4b',
    messages: messages || [],
    stream: true,
  });

  return new Promise((resolve, reject) => {
    let buffer = '';
    const req = http.request({
      hostname: 'localhost',
      port: 11434,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      if (res.statusCode !== 200) {
        let errData = '';
        res.on('data', c => errData += c);
        res.on('end', () => reject(new Error(`Ollama 错误 ${res.statusCode}: 请确保本地已运行 Ollama 并拉取 qwen3:4b 模型`)));
        return;
      }
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const obj = JSON.parse(line);
            const content = obj.message?.content;
            if (content != null && typeof content === 'string') onChunk(content);
            if (obj.done) resolve();
          } catch {}
        }
      });
      res.on('end', () => resolve());
    });
    req.on('error', () => reject(new Error('无法连接 Ollama，请确保本地已启动 Ollama 服务')));
    req.write(body);
    req.end();
  });
}

module.exports = { callQwenOnline, callOllamaLocal, getConfig };
