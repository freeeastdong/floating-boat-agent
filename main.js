const { app, BrowserWindow, screen, ipcMain } = require('electron');
const { callQwenOnline, callOllamaLocal, callOllamaVision } = require('./api');

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: 200,
    height: 340,
    x: width - 220,
    y: 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
  
  let mouseCheckInterval = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const pos = screen.getCursorScreenPoint();
    const bounds = mainWindow.getBounds();
    mainWindow.webContents.send('mouse-pos', { x: pos.x, y: pos.y, bounds });
  }, 50);
  
  ipcMain.on('window-move', (e, { deltaX, deltaY }) => {
    if (mainWindow) {
      const [x, y] = mainWindow.getPosition();
      mainWindow.setPosition(x + deltaX, y + deltaY);
    }
  });

  ipcMain.handle('chat-request', async (e, { model, userMessage, history, images }) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    const errMsg = (err) => typeof err?.message === 'string' ? err.message : (err ? String(err) : '未知错误');
    const sendChunk = (text) => { if (typeof text === 'string' && text) win?.webContents.send('chat-chunk', text); };

    try {
      if (model === 'qwen') {
        const messages = [
          ...(history || []),
          { role: 'user', content: userMessage },
        ];
        await callQwenOnline(messages, sendChunk);
      } else if (model === 'ollama') {
        const messages = [
          ...(history || []),
          { role: 'user', content: userMessage },
        ];
        await callOllamaLocal(messages, sendChunk);
      } else if (model === 'ollama-vl') {
        const userMsg = { role: 'user', content: userMessage };
        if (images && images.length) userMsg.images = images;
        const messages = [
          ...(history || []),
          userMsg,
        ];
        await callOllamaVision(messages, sendChunk);
      } else {
        throw new Error('未知模型');
      }
    } catch (err) {
      win?.webContents.send('chat-error', errMsg(err));
    } finally {
      win?.webContents.send('chat-done');
    }
  });
  
  mainWindow.on('closed', () => clearInterval(mouseCheckInterval));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
