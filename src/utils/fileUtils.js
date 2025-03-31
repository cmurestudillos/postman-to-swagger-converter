const fs = require('fs');
const path = require('path');

/**
 * Lee un archivo JSON y devuelve su contenido como objeto
 * @param {string} filePath - Ruta del archivo a leer
 * @returns {Promise<Object>} Contenido del archivo como objeto
 */
async function readJsonFile(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error al leer el archivo JSON ${filePath}:`, error);
    throw new Error(`No se pudo leer el archivo JSON: ${error.message}`);
  }
}

/**
 * Escribe un objeto como archivo JSON
 * @param {string} filePath - Ruta donde guardar el archivo
 * @param {Object} data - Objeto a guardar
 * @param {boolean} [pretty=true] - Si debe formatear el JSON
 * @returns {Promise<void>}
 */
async function writeJsonFile(filePath, data, pretty = true) {
  try {
    const content = pretty 
      ? JSON.stringify(data, null, 2) 
      : JSON.stringify(data);
      
    await fs.promises.writeFile(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Error al escribir el archivo JSON ${filePath}:`, error);
    throw new Error(`No se pudo escribir el archivo JSON: ${error.message}`);
  }
}

/**
 * Escribe un string en un archivo
 * @param {string} filePath - Ruta donde guardar el archivo
 * @param {string} content - Contenido a guardar
 * @returns {Promise<void>}
 */
async function writeTextFile(filePath, content) {
  try {
    await fs.promises.writeFile(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Error al escribir el archivo ${filePath}:`, error);
    throw new Error(`No se pudo escribir el archivo: ${error.message}`);
  }
}

/**
 * Comprueba si un archivo existe
 * @param {string} filePath - Ruta del archivo a comprobar
 * @returns {Promise<boolean>} true si existe, false en caso contrario
 */
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Crea un directorio recursivamente si no existe
 * @param {string} dirPath - Ruta del directorio a crear
 * @returns {Promise<void>}
 */
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error al crear el directorio ${dirPath}:`, error);
    throw new Error(`No se pudo crear el directorio: ${error.message}`);
  }
}

module.exports = {
  readJsonFile,
  writeJsonFile,
  writeTextFile,
  fileExists,
  ensureDirectoryExists
};