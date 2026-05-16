/**
 * Clase que representa un documento Swagger/OpenAPI
 */
class SwaggerDocument {
  /**
   * Crea una instancia de SwaggerDocument
   * @param {Object} info - Información básica de la API
   * @param {string} info.title - Título de la API
   * @param {string} info.version - Versión de la API
   * @param {string} [info.description] - Descripción de la API
   */
  constructor(info) {
    this.document = {
      openapi: '3.0.0',
      info: {
        title: info.title || 'API',
        version: info.version || '1.0.0',
        description: info.description || '',
      },
      servers: [],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {},
      },
    };
  }

  /**
   * Agrega un servidor al documento
   * @param {string} url - URL del servidor
   * @param {string} [description] - Descripción del servidor
   */
  addServer(url, description = '') {
    this.document.servers.push({ url, description });
  }

  /**
   * Agrega una etiqueta al documento
   * @param {string} name - Nombre de la etiqueta
   * @param {string} [description] - Descripción de la etiqueta
   */
  addTag(name, description = '') {
    if (!this.document.tags) {
      this.document.tags = [];
    }
    const exists = this.document.tags.some(tag => tag.name === name);
    if (!exists) {
      this.document.tags.push({ name, description });
    }
  }

  /**
   * Agrega una operación (endpoint) al documento
   * @param {Object} operation - Datos de la operación
   * @param {string} operation.path - Ruta del endpoint
   * @param {string} operation.method - Método HTTP (get, post, etc.)
   * @param {string} operation.summary - Resumen de la operación
   * @param {string} [operation.description] - Descripción detallada
   * @param {Array} [operation.tags] - Etiquetas asociadas
   * @param {Array} [operation.parameters] - Parámetros de la operación
   * @param {Object} [operation.requestBody] - Cuerpo de la solicitud
   * @param {Object} [operation.responses] - Respuestas posibles
   * @param {Array} [operation.security] - Requerimientos de seguridad de la operación
   */
  addOperation(operation) {
    const { path, method, summary, description, tags, parameters, requestBody, responses, security } = operation;

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (!this.document.paths[normalizedPath]) {
      this.document.paths[normalizedPath] = {};
    }

    this.document.paths[normalizedPath][method] = {
      summary: summary || '',
      description: description || '',
      tags: tags || [],
      parameters: parameters || [],
      responses: responses || { 200: { description: 'Operación exitosa' } },
    };

    if (requestBody) {
      this.document.paths[normalizedPath][method].requestBody = requestBody;
    }

    // security: [] explícito desactiva la auth global para esta operación (noauth)
    if (security !== undefined) {
      this.document.paths[normalizedPath][method].security = security;
    }
  }

  /**
   * Agrega un esquema a los componentes
   * @param {string} name - Nombre del esquema
   * @param {Object} schema - Definición del esquema
   */
  addSchema(name, schema) {
    this.document.components.schemas[name] = schema;
  }

  /**
   * Agrega un esquema de seguridad a los componentes (sin duplicados)
   * @param {string} name - Nombre del esquema de seguridad
   * @param {Object} scheme - Definición del esquema de seguridad
   */
  addSecurityScheme(name, scheme) {
    this.document.components.securitySchemes[name] = scheme;
  }

  /**
   * Agrega un requisito de seguridad global al documento
   * @param {string} name - Nombre del esquema de seguridad a aplicar globalmente
   */
  addGlobalSecurity(name) {
    if (!this.document.security) {
      this.document.security = [];
    }
    const exists = this.document.security.some(s => Object.prototype.hasOwnProperty.call(s, name));
    if (!exists) {
      this.document.security.push({ [name]: [] });
    }
  }

  /**
   * Obtiene el documento completo
   * @returns {Object} Documento Swagger/OpenAPI
   */
  getDocument() {
    return this.document;
  }
}

module.exports = {
  SwaggerDocument,
};
