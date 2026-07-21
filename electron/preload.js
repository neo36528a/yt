// ============================================================
// Ultra Video Downloader — Electron Preload Script
// Exposes safe APIs from the main process to the renderer
// ============================================================

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Get the default download path
  getDownloadPath: () => ipcRenderer.invoke('get-download-path'),

  // Open a folder in the system file explorer
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),

  // Get application info (version, platform, etc.)
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // Open a native folder picker dialog
  selectDownloadFolder: () => ipcRenderer.invoke('select-download-folder'),

  // Check if running inside Electron
  isElectron: true,
});
