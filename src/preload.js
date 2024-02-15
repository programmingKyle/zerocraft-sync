const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    frameHandler: (data) => ipcRenderer.invoke('frame-handler', data),
    hostSettingsHandler: (data) => ipcRenderer.invoke('host-settings-handler', data),
});