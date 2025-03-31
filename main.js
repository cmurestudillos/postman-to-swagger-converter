const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { convertPostmanToSwagger } = require('./src/converter');

// Mantener una referencia global para evitar que la ventana se cierre automáticamente
let mainWindow;

function createWindow() {
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1024,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Cargar el archivo HTML principal
  mainWindow.loadFile('index.html');

  // Abrir DevTools en desarrollo
  // mainWindow.webContents.openDevTools();

  // Manejar cuando la ventana se cierra
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Crear ventana cuando la app esté lista
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // En macOS, es común recrear una ventana cuando
    // se hace clic en el ícono del dock y no hay otras ventanas abiertas
    if (mainWindow === null) createWindow();
  });
});

// Salir cuando todas las ventanas están cerradas, excepto en macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Manejo de eventos desde el renderer

// Abrir archivo Postman
ipcMain.handle('open-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Colecciones Postman', extensions: ['json'] }
    ]
  });
  
  if (canceled) return null;
  
  try {
    const fileContent = fs.readFileSync(filePaths[0], 'utf8');
    return { path: filePaths[0], content: fileContent };
  } catch (err) {
    console.error('Error al leer el archivo:', err);
    return null;
  }
});

// Convertir Postman a Swagger
ipcMain.handle('convert-collection', async (event, postmanJson) => {
  try {
    const swaggerYaml = await convertPostmanToSwagger(postmanJson);
    return swaggerYaml;
  } catch (err) {
    console.error('Error en la conversión:', err);
    return null;
  }
});

// Guardar archivo YAML
ipcMain.handle('save-file', async (event, yamlContent) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Guardar archivo YAML',
    defaultPath: 'swagger-definition.yaml',
    filters: [
      { name: 'YAML', extensions: ['yaml', 'yml'] }
    ]
  });
  
  if (canceled) return false;
  
  try {
    fs.writeFileSync(filePath, yamlContent, 'utf8');
    return true;
  } catch (err) {
    console.error('Error al guardar el archivo:', err);
    return false;
  }
});