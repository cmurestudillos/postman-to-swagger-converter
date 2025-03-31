const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura a la ventana del navegador
contextBridge.exposeInMainWorld('electronAPI', {
  // Métodos para archivos
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (content) => ipcRenderer.invoke('save-file', content),
  
  // Método para conversión
  convertCollection: (postmanJson) => ipcRenderer.invoke('convert-collection', postmanJson)
});