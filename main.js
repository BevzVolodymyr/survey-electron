const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

ipcMain.handle('save-file', async (event, content, fileName) => {
  try {
    const dirPath = path.join(os.homedir(), 'Documents', 'Surveys');
    const fullPath = path.join(dirPath, fileName);

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(fullPath, content);
    return fullPath;
  } catch (error) {
    console.error('Помилка збереження файлу:', error);
    throw error;
  }
});

ipcMain.handle('show-message-box', async (event, options) => {
  const { dialog } = require('electron');
  return dialog.showMessageBox(options);
});

ipcMain.handle('show-confirm-box', async (event, options) => {
  const { dialog } = require('electron');
  const result = await dialog.showMessageBox(options);
  return result.response;
});

ipcMain.on('quit-app', () => {
  app.quit();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});