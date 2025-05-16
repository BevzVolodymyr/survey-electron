const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (content, fileName) => ipcRenderer.invoke('save-file', content, fileName),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showConfirmBox: (options) => ipcRenderer.invoke('show-confirm-box', options),
  quitApp: () => ipcRenderer.send('quit-app')
});