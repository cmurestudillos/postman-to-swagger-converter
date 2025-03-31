// Variables globales
let postmanCollection = null;
let swaggerYaml = null;

// Referencias a elementos del DOM
const selectFileBtn = document.getElementById('selectFileBtn');
const selectedFileName = document.getElementById('selectedFileName');
const jsonEditor = document.getElementById('jsonEditor');
const yamlEditor = document.getElementById('yamlEditor');
const convertBtn = document.getElementById('convertBtn');
const saveBtn = document.getElementById('saveBtn');
const copyBtn = document.getElementById('copyBtn');
const logsElement = document.getElementById('logs');

// Función para agregar entradas de log
function addLog(message, type = 'info') {
  const logEntry = document.createElement('div');
  logEntry.classList.add('log-entry', `log-${type}`);
  
  const timestamp = new Date().toLocaleTimeString();
  logEntry.textContent = `[${timestamp}] ${message}`;
  
  logsElement.appendChild(logEntry);
  logsElement.scrollTop = logsElement.scrollHeight;
}

// Función para actualizar el contenido del editor JSON
function updateJsonEditor(content) {
  try {
    const formattedJson = JSON.stringify(JSON.parse(content), null, 2);
    jsonEditor.textContent = formattedJson;
    // Habilitar el botón de conversión
    convertBtn.disabled = false;
  } catch (err) {
    addLog(`Error al formatear JSON: ${err.message}`, 'error');
    jsonEditor.textContent = content;
  }
}

// Función para actualizar el contenido del editor YAML
function updateYamlEditor(content) {
  yamlEditor.textContent = content;
  // Habilitar botones de guardar y copiar
  saveBtn.disabled = false;
  copyBtn.disabled = false;
}

// Manejador para seleccionar archivo
selectFileBtn.addEventListener('click', async () => {
  const result = await window.electronAPI.openFile();
  
  if (result) {
    const fileName = result.path.split(/[/\\]/).pop();
    selectedFileName.textContent = fileName;
    addLog(`Archivo cargado: ${fileName}`, 'info');
    
    updateJsonEditor(result.content);
    postmanCollection = result.content;
  }
});

// Manejador para convertir colección
convertBtn.addEventListener('click', async () => {
  if (!postmanCollection) {
    addLog('No hay colección para convertir', 'warning');
    return;
  }
  
  addLog('Iniciando conversión...', 'info');
  
  try {
    const jsonData = JSON.parse(postmanCollection);
    swaggerYaml = await window.electronAPI.convertCollection(jsonData);
    
    if (swaggerYaml) {
      updateYamlEditor(swaggerYaml);
      addLog('Conversión completada con éxito', 'success');
    } else {
      addLog('Error durante la conversión', 'error');
    }
  } catch (err) {
    addLog(`Error al procesar JSON: ${err.message}`, 'error');
  }
});

// Manejador para guardar archivo
saveBtn.addEventListener('click', async () => {
  if (!swaggerYaml) {
    addLog('No hay contenido YAML para guardar', 'warning');
    return;
  }
  
  const saved = await window.electronAPI.saveFile(swaggerYaml);
  
  if (saved) {
    addLog('Archivo YAML guardado correctamente', 'success');
  } else {
    addLog('No se pudo guardar el archivo YAML', 'error');
  }
});

// Manejador para copiar al portapapeles
copyBtn.addEventListener('click', () => {
  if (!swaggerYaml) {
    addLog('No hay contenido YAML para copiar', 'warning');
    return;
  }
  
  navigator.clipboard.writeText(swaggerYaml)
    .then(() => {
      addLog('Contenido YAML copiado al portapapeles', 'success');
    })
    .catch(err => {
      addLog(`Error al copiar: ${err.message}`, 'error');
    });
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  addLog('Aplicación iniciada. Seleccione un archivo de colección Postman para comenzar.', 'info');
});