const yaml = require('js-yaml');
const _ = require('lodash');
const { PostmanCollection } = require('./models/PostmanCollection');
const { SwaggerDocument } = require('./models/SwaggerDocument');

/**
 * Convierte una colección de Postman a formato YAML para Swagger
 * @param {Object|string} postmanJson - Colección de Postman en formato JSON o string
 * @returns {Promise<string>} Documento Swagger en formato YAML
 */
async function convertPostmanToSwagger(postmanJson) {
  try {
    // Asegurarse de que tenemos un objeto
    const postmanData = typeof postmanJson === 'string' 
      ? JSON.parse(postmanJson) 
      : postmanJson;
    
    // Crear una instancia de PostmanCollection
    const collection = new PostmanCollection(postmanData);
    
    // Extraer información básica
    const info = collection.getInfo();
    
    // Inicializar documento Swagger
    const swagger = new SwaggerDocument({
      title: info.name,
      version: '1.0.0',
      description: info.description || `API generada a partir de la colección Postman: ${info.name}`
    });
    
    // Configurar servidores
    const variables = collection.getVariables();
    for (const [key, value] of Object.entries(variables)) {
      if (key.toLowerCase().includes('url') || key.toLowerCase().includes('base')) {
        swagger.addServer(value, `Variable de entorno: ${key}`);
      }
    }
    
    // Procesar las rutas
    const items = collection.getItems();
    processItems(items, swagger);
    
    // Convertir a YAML
    const yamlString = yaml.dump(swagger.getDocument(), {
      indent: 2,
      lineWidth: -1, // No limitar el ancho de línea
      noRefs: true   // No usar referencias
    });
    
    return yamlString;
  } catch (error) {
    console.error('Error en la conversión:', error);
    throw error;
  }
}

/**
 * Procesa recursivamente los elementos de la colección
 * @param {Array} items - Elementos de la colección Postman
 * @param {SwaggerDocument} swagger - Documento Swagger en construcción
 * @param {string} [tagName=''] - Nombre para etiquetas
 */
function processItems(items, swagger, tagName = '') {
  for (const item of items) {
    if (item.item && Array.isArray(item.item)) {
      // Es una carpeta/grupo
      const newTagName = item.name || tagName;
      
      // Agregar descripción de la carpeta como tag si existe
      if (item.description) {
        swagger.addTag(newTagName, item.description);
      }
      
      processItems(item.item, swagger, newTagName);
    } else if (item.request) {
      // Es un endpoint
      processRequest(item, swagger, tagName);
    }
  }
}

/**
 * Procesa una solicitud/endpoint de Postman
 * @param {Object} item - Elemento de solicitud de Postman
 * @param {SwaggerDocument} swagger - Documento Swagger en construcción
 * @param {string} tagName - Nombre de la etiqueta
 */
function processRequest(item, swagger, tagName) {
  const request = item.request;
  
  // Extraer método HTTP
  const method = request.method ? request.method.toLowerCase() : 'get';
  
  // Extraer la URL y parámetros
  let path = '';
  let queryParams = [];
  let pathParams = [];
  
  if (typeof request.url === 'string') {
    path = extractPath(request.url);
  } else if (request.url) {
    path = Array.isArray(request.url.path) 
      ? '/' + request.url.path.join('/') 
      : request.url.path || '';
      
    // Extraer parámetros de consulta
    if (request.url.query && Array.isArray(request.url.query)) {
      queryParams = request.url.query;
    }
    
    // Detectar variables de ruta
    path = path.replace(/\/:([^/]+)/g, '/{$1}');
    path = path.replace(/\{(.+?)\}/g, (match, paramName) => {
      pathParams.push({
        name: paramName,
        description: `Parámetro de ruta: ${paramName}`
      });
      return `{${paramName}}`;
    });
  }
  
  // Extraer cuerpo de la solicitud
  let requestBody = null;
  if (request.body) {
    requestBody = extractRequestBody(request.body);
  }
  
  // Extraer descripción
  const description = item.description || item.name;
  
  // Agregar la operación al documento Swagger
  swagger.addOperation({
    path,
    method,
    summary: item.name,
    description: description,
    tags: tagName ? [tagName] : undefined,
    parameters: [
      ...pathParams.map(param => ({
        name: param.name,
        in: 'path',
        description: param.description,
        required: true,
        schema: { type: 'string' }
      })),
      ...queryParams.map(param => ({
        name: param.key,
        in: 'query',
        description: param.description || `Parámetro: ${param.key}`,
        required: !!param.required,
        schema: { type: 'string' }
      }))
    ],
    requestBody: requestBody,
    responses: {
      '200': {
        description: 'Operación exitosa'
      },
      '400': {
        description: 'Solicitud incorrecta'
      },
      '401': {
        description: 'No autorizado'
      },
      '404': {
        description: 'No encontrado'
      },
      '500': {
        description: 'Error interno del servidor'
      }
    }
  });
  
  // Generar esquemas a partir del cuerpo de la solicitud
  if (requestBody && requestBody.content && requestBody.content['application/json'] && 
      requestBody.content['application/json'].schema) {
    generateSchemas(requestBody.content['application/json'].schema, item.name, swagger);
  }
}

/**
 * Extrae la ruta de una URL
 * @param {string} url - URL completa
 * @returns {string} Ruta extraída
 */
function extractPath(url) {
  try {
    // Eliminar protocolo
    let path = url.replace(/^https?:\/\/[^/]+/i, '');
    
    // Eliminar parámetros de consulta
    path = path.replace(/\?.*$/, '');
    
    // Reemplazar variables con formato {variable}
    path = path.replace(/\{\{([^}]+)\}\}/g, '{$1}');
    
    return path;
  } catch (error) {
    console.error('Error al extraer la ruta:', error);
    return url;
  }
}

/**
 * Extrae el cuerpo de la solicitud
 * @param {Object} body - Objeto de cuerpo de Postman
 * @returns {Object|null} Objeto de cuerpo para Swagger
 */
function extractRequestBody(body) {
  if (!body || !body.mode) {
    return null;
  }
  
  const mode = body.mode;
  
  if (mode === 'raw' && body.raw) {
    try {
      // Intentar analizar como JSON
      const contentType = 
        (body.options && body.options.raw && body.options.raw.language === 'json') 
          ? 'application/json' 
          : 'text/plain';
      
      if (contentType === 'application/json') {
        let schema = { type: 'object' };
        
        try {
          const jsonContent = JSON.parse(body.raw);
          schema = inferSchema(jsonContent);
        } catch (e) {
          console.warn('No se pudo analizar el cuerpo JSON:', e);
        }
        
        return {
          required: true,
          content: {
            'application/json': {
              schema: schema
            }
          }
        };
      } else {
        return {
          required: true,
          content: {
            'text/plain': {
              schema: {
                type: 'string',
                example: body.raw
              }
            }
          }
        };
      }
    } catch (e) {
      console.warn('Error al procesar el cuerpo raw:', e);
    }
  } else if (mode === 'formdata' && body.formdata) {
    const schema = {
      type: 'object',
      properties: {}
    };
    
    body.formdata.forEach(param => {
      schema.properties[param.key] = {
        type: 'string',
        description: param.description || `Parámetro: ${param.key}`
      };
      
      if (param.value) {
        schema.properties[param.key].example = param.value;
      }
    });
    
    return {
      required: true,
      content: {
        'multipart/form-data': {
          schema: schema
        }
      }
    };
  } else if (mode === 'urlencoded' && body.urlencoded) {
    const schema = {
      type: 'object',
      properties: {}
    };
    
    body.urlencoded.forEach(param => {
      schema.properties[param.key] = {
        type: 'string',
        description: param.description || `Parámetro: ${param.key}`
      };
      
      if (param.value) {
        schema.properties[param.key].example = param.value;
      }
    });
    
    return {
      required: true,
      content: {
        'application/x-www-form-urlencoded': {
          schema: schema
        }
      }
    };
  }
  
  return null;
}

/**
 * Infiere el esquema a partir de un objeto JSON
 * @param {*} obj - Objeto del que inferir el esquema
 * @returns {Object} Esquema inferido
 */
function inferSchema(obj) {
  if (obj === null) {
    return { type: 'null' };
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return {
        type: 'array',
        items: {}
      };
    }
    
    // Usar el primer elemento como referencia para el esquema de items
    const itemSchema = inferSchema(obj[0]);
    return {
      type: 'array',
      items: itemSchema
    };
  }
  
  if (typeof obj === 'object') {
    const schema = {
      type: 'object',
      properties: {}
    };
    
    for (const [key, value] of Object.entries(obj)) {
      schema.properties[key] = inferSchema(value);
    }
    
    return schema;
  }
  
  if (typeof obj === 'string') {
    return { type: 'string', example: obj };
  }
  
  if (typeof obj === 'number') {
    if (Number.isInteger(obj)) {
      return { type: 'integer', example: obj };
    }
    return { type: 'number', example: obj };
  }
  
  if (typeof obj === 'boolean') {
    return { type: 'boolean', example: obj };
  }
  
  return { type: 'string' }; // Por defecto
}

/**
 * Genera esquemas a partir del esquema inferido
 * @param {Object} schema - Esquema inferido
 * @param {string} name - Nombre base para el esquema
 * @param {SwaggerDocument} swagger - Documento Swagger
 */
function generateSchemas(schema, name, swagger) {
  // Simplificado para el ejemplo
  // En una implementación completa, recorrería el esquema recursivamente
  // buscando objetos complejos para crear componentes reutilizables
  
  if (schema.type === 'object' && Object.keys(schema.properties || {}).length > 0) {
    const schemaName = `${_.upperFirst(_.camelCase(name))}`;
    swagger.addSchema(schemaName, schema);
  }
}

module.exports = {
  convertPostmanToSwagger
};