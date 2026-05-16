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
    const postmanData = typeof postmanJson === 'string' ? JSON.parse(postmanJson) : postmanJson;

    // Crear una instancia de PostmanCollection
    const collection = new PostmanCollection(postmanData);

    // Extraer información básica
    const info = collection.getInfo();

    // Inicializar documento Swagger
    const swagger = new SwaggerDocument({
      title: info.name,
      version: '1.0.0',
      description: info.description || `API generada a partir de la colección Postman: ${info.name}`,
    });

    // Configurar servidores
    const variables = collection.getVariables();
    for (const [key, value] of Object.entries(variables)) {
      if (key.toLowerCase().includes('url') || key.toLowerCase().includes('base')) {
        swagger.addServer(value, `Variable de entorno: ${key}`);
      }
    }

    // Configurar seguridad a nivel de colección
    const collectionSecurity = extractSecurityScheme(collection.getAuth());
    if (collectionSecurity) {
      swagger.addSecurityScheme(collectionSecurity.name, collectionSecurity.scheme);
      swagger.addGlobalSecurity(collectionSecurity.name);
    }

    // Procesar las rutas
    const items = collection.getItems();
    processItems(items, swagger);

    // Convertir a YAML
    const yamlString = yaml.dump(swagger.getDocument(), {
      indent: 2,
      lineWidth: -1, // No limitar el ancho de línea
      noRefs: true, // No usar referencias
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
 * Extrae path, pathParams y queryParams de la URL de una solicitud Postman
 * @param {string|Object} url - URL de Postman (string u objeto estructurado)
 * @returns {{path: string, pathParams: Array, queryParams: Array}} Datos extraídos de la URL
 */
function extractUrlInfo(url) {
  if (typeof url === 'string') {
    return { path: extractPath(url), pathParams: [], queryParams: [] };
  }

  if (!url) {
    return { path: '', pathParams: [], queryParams: [] };
  }

  let path = Array.isArray(url.path) ? '/' + url.path.join('/') : url.path || '';
  const queryParams = url.query && Array.isArray(url.query) ? url.query : [];
  const pathParams = [];

  path = path.replace(/\/:([^/]+)/g, '/{$1}');
  const seen = new Set();
  path = path.replace(/\{(.+?)\}/g, (match, name) => {
    if (!seen.has(name)) {
      seen.add(name);
      pathParams.push({ name, description: `Parámetro de ruta: ${name}` });
    }
    return `{${name}}`;
  });

  return { path, pathParams, queryParams };
}

/**
 * Extrae el valor de un parámetro de auth por clave
 * @param {Array} params - Array de parámetros de auth Postman
 * @param {string} key - Clave a buscar
 * @param {string} fallback - Valor por defecto
 * @returns {string} Valor encontrado o fallback
 */
function getAuthParam(params, key, fallback) {
  return params.find(p => p.key === key)?.value || fallback;
}

/**
 * Construye el securityScheme para autenticación de tipo apikey
 * @param {Array} params - Parámetros apikey de Postman
 * @returns {{name: string, scheme: Object}} Esquema de seguridad
 */
function buildApiKeyScheme(params) {
  return {
    name: 'apiKeyAuth',
    scheme: {
      type: 'apiKey',
      in: getAuthParam(params, 'in', 'header'),
      name: getAuthParam(params, 'key', 'X-API-Key'),
    },
  };
}

/**
 * Construye el securityScheme para autenticación de tipo oauth2
 * @param {Array} params - Parámetros oauth2 de Postman
 * @returns {{name: string, scheme: Object}} Esquema de seguridad
 */
function buildOAuth2Scheme(params) {
  return {
    name: 'oauth2Auth',
    scheme: {
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: getAuthParam(params, 'authUrl', ''),
          tokenUrl: getAuthParam(params, 'accessTokenUrl', ''),
          scopes: {},
        },
      },
    },
  };
}

/**
 * Convierte un objeto de autenticación Postman a un securityScheme OpenAPI
 * @param {Object|null} auth - Objeto de autenticación de Postman
 * @returns {{name: string, scheme: Object}|null} Esquema de seguridad, o null si no aplica
 */
function extractSecurityScheme(auth) {
  if (!auth || auth.type === 'noauth') return null;

  const builders = {
    bearer: () => ({ name: 'bearerAuth', scheme: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }),
    basic: () => ({ name: 'basicAuth', scheme: { type: 'http', scheme: 'basic' } }),
    apikey: () => buildApiKeyScheme(auth.apikey || []),
    oauth2: () => buildOAuth2Scheme(auth.oauth2 || []),
  };

  return builders[auth.type]?.() ?? null;
}

/**
 * Resuelve la seguridad a nivel de operación a partir del auth del request
 * @param {Object|undefined} auth - Auth del request Postman
 * @param {SwaggerDocument} swagger - Documento Swagger en construcción
 * @returns {Array|undefined} Array de requisitos de seguridad, o undefined si hereda la global
 */
function resolveOperationSecurity(auth, swagger) {
  if (!auth) return undefined;
  if (auth.type === 'noauth') return []; // [] desactiva la auth global para este endpoint
  const scheme = extractSecurityScheme(auth);
  if (!scheme) return undefined;
  swagger.addSecurityScheme(scheme.name, scheme.scheme);
  return [{ [scheme.name]: [] }];
}

/**
 * Procesa una solicitud/endpoint de Postman
 * @param {Object} item - Elemento de solicitud de Postman
 * @param {SwaggerDocument} swagger - Documento Swagger en construcción
 * @param {string} tagName - Nombre de la etiqueta
 */
function processRequest(item, swagger, tagName) {
  const request = item.request;
  const method = request.method ? request.method.toLowerCase() : 'get';
  const { path, pathParams, queryParams } = extractUrlInfo(request.url);
  const requestBody = request.body ? extractRequestBody(request.body) : null;
  const description = item.description || item.name;

  const operationSecurity = resolveOperationSecurity(request.auth, swagger);

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
        schema: { type: 'string' },
      })),
      ...queryParams.map(param => ({
        name: param.key,
        in: 'query',
        description: param.description || `Parámetro: ${param.key}`,
        required: !!param.required,
        schema: { type: 'string' },
      })),
    ],
    requestBody: requestBody,
    security: operationSecurity,
    responses: {
      200: { description: 'Operación exitosa' },
      400: { description: 'Solicitud incorrecta' },
      401: { description: 'No autorizado' },
      404: { description: 'No encontrado' },
      500: { description: 'Error interno del servidor' },
    },
  });

  const jsonSchema = requestBody?.content?.['application/json']?.schema;
  if (jsonSchema) {
    generateSchemas(jsonSchema, item.name, swagger);
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
 * Construye un esquema OpenAPI desde un array de parámetros clave-valor
 * @param {Array} params - Parámetros Postman (formdata o urlencoded)
 * @returns {Object} Esquema OpenAPI tipo object
 */
function buildKeyValueSchema(params) {
  const schema = { type: 'object', properties: {} };
  params.forEach(param => {
    schema.properties[param.key] = {
      type: 'string',
      description: param.description || `Parámetro: ${param.key}`,
    };
    if (param.value) {
      schema.properties[param.key].example = param.value;
    }
  });
  return schema;
}

/**
 * Extrae el cuerpo raw de una solicitud Postman
 * @param {Object} body - Objeto de cuerpo Postman con mode 'raw'
 * @returns {Object|null} Objeto requestBody para Swagger
 */
function extractRawBody(body) {
  try {
    const isJson = body.options?.raw?.language === 'json';
    if (isJson) {
      let schema = { type: 'object' };
      try {
        schema = inferSchema(JSON.parse(body.raw));
      } catch (e) {
        console.warn('No se pudo analizar el cuerpo JSON:', e);
      }
      return { required: true, content: { 'application/json': { schema } } };
    }
    return { required: true, content: { 'text/plain': { schema: { type: 'string', example: body.raw } } } };
  } catch (e) {
    console.warn('Error al procesar el cuerpo raw:', e);
    return null;
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

  if (body.mode === 'raw' && body.raw) {
    return extractRawBody(body);
  }

  if (body.mode === 'formdata' && body.formdata) {
    return { required: true, content: { 'multipart/form-data': { schema: buildKeyValueSchema(body.formdata) } } };
  }

  if (body.mode === 'urlencoded' && body.urlencoded) {
    return {
      required: true,
      content: { 'application/x-www-form-urlencoded': { schema: buildKeyValueSchema(body.urlencoded) } },
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
    return { nullable: true, type: 'string' };
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return {
        type: 'array',
        items: {},
      };
    }

    // Usar el primer elemento como referencia para el esquema de items
    const itemSchema = inferSchema(obj[0]);
    return {
      type: 'array',
      items: itemSchema,
    };
  }

  if (typeof obj === 'object') {
    const schema = {
      type: 'object',
      properties: {},
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
  convertPostmanToSwagger,
};
