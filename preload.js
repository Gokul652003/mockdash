const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  serverStart: (config) => ipcRenderer.invoke('server:start', config),
  serverStop: () => ipcRenderer.invoke('server:stop'),
  getState: () => ipcRenderer.invoke('server:getState'),
  listEndpoints: () => ipcRenderer.invoke('endpoints:list'),
  addEndpoint: (ep) => ipcRenderer.invoke('endpoints:add', ep),
  updateEndpoint: (ep) => ipcRenderer.invoke('endpoints:update', ep),
  applyEndpoint: (ep) => ipcRenderer.invoke('endpoints:apply', ep),
  removeEndpoint: (id) => ipcRenderer.invoke('endpoints:remove', id),

  onLog: (cb) => ipcRenderer.on('server:log', (_e, data) => cb(data)),
  onStatus: (cb) => ipcRenderer.on('server:status', (_e, data) => cb(data)),
});