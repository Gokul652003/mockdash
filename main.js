const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const MockServer = require('./server');

let mainWindow;
const server = new MockServer();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'MockDash',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

// --- IPC: configuration ---
ipcMain.handle('server:start', async (_e, config) => {
  return server.start(config);
});

ipcMain.handle('server:stop', async () => {
  return server.stop();
});

ipcMain.handle('server:getState', async () => {
  return server.getState();
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
