const yaml = require('js-yaml');
const fs = require('fs');

/**
 * Convierte un objeto JavaScript a string YAML
 * @param {Object} data - Objeto a convertir
 * @param {Object} [options] - Opciones para el formato YAML
 * @returns {string} String YAML
 */
function objectToYaml(data, options = {}) {
  try {
    const defaultOptions = { indent: 2, lineWidth: -1, noRefs: true };
    return yaml.dump(data, { ...defaultOptions, ...options });
  } catch (error) {
    console.error('Error al convertir objeto a YAML:', error);
    throw new Error(`No se pudo convertir a YAML: ${error.message}`, { cause: error });
  }
}

/**
 * Convierte un string YAML a objeto JavaScript
 * @param {string} yamlStr - String YAML
 * @returns {Object} Objeto convertido
 */
function yamlToObject(yamlStr) {
  try {
    return yaml.load(yamlStr);
  } catch (error) {
    console.error('Error al convertir YAML a objeto:', error);
    throw new Error(`No se pudo parsear el YAML: ${error.message}`, { cause: error });
  }
}

/**
 * Lee un archivo YAML y devuelve su contenido como objeto
 * @param {string} filePath - Ruta del archivo a leer
 * @returns {Promise<Object>} Contenido del archivo como objeto
 */
async function readYamlFile(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return yamlToObject(content);
  } catch (error) {
    console.error(`Error al leer el archivo YAML ${filePath}:`, error);
    throw new Error(`No se pudo leer el archivo YAML: ${error.message}`, { cause: error });
  }
}

/**
 * Escribe un objeto como archivo YAML
 * @param {string} filePath - Ruta donde guardar el archivo
 * @param {Object} data - Objeto a guardar
 * @param {Object} [options] - Opciones para el formato YAML
 * @returns {Promise<void>}
 */
async function writeYamlFile(filePath, data, options = {}) {
  try {
    const content = objectToYaml(data, options);
    await fs.promises.writeFile(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Error al escribir el archivo YAML ${filePath}:`, error);
    throw new Error(`No se pudo escribir el archivo YAML: ${error.message}`, { cause: error });
  }
}

module.exports = {
  objectToYaml,
  yamlToObject,
  readYamlFile,
  writeYamlFile,
};
