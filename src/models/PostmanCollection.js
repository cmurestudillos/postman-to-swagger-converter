/**
 * Clase que representa una colección de Postman
 */
class PostmanCollection {
    /**
     * Crea una instancia de PostmanCollection
     * @param {Object} data - Datos de la colección Postman
     */
    constructor(data) {
      this.data = data;
    }
  
    /**
     * Obtiene la información básica de la colección
     * @returns {Object} Información de la colección
     */
    getInfo() {
      if (!this.data.info) {
        return { name: 'API Collection', description: '' };
      }
      
      return {
        name: this.data.info.name || 'API Collection',
        description: this.data.info.description || '',
        schema: this.data.info.schema || '',
        postmanId: this.data.info._postman_id || ''
      };
    }
  
    /**
     * Obtiene los elementos (carpetas y requests) de la colección
     * @returns {Array} Elementos de la colección
     */
    getItems() {
      if (this.data.item && Array.isArray(this.data.item)) {
        return this.data.item;
      }
      return [];
    }
  
    /**
     * Obtiene las variables de la colección
     * @returns {Object} Variables como pares clave-valor
     */
    getVariables() {
      const variables = {};
      
      // Variables de la colección
      if (this.data.variable && Array.isArray(this.data.variable)) {
        this.data.variable.forEach(v => {
          if (v.key && v.value !== undefined) {
            variables[v.key] = v.value;
          }
        });
      }
      
      // Variables en el evento de la colección
      if (this.data.event && Array.isArray(this.data.event)) {
        this.data.event.forEach(event => {
          if (event.script && event.script.exec) {
            // Buscar definiciones de variables en los scripts
            const scriptText = Array.isArray(event.script.exec) 
              ? event.script.exec.join('\n') 
              : event.script.exec;
            
            // Buscar patrones como pm.variables.set("key", "value")
            const regex = /pm\.(?:environment|globals|variables)\.set\(['"](.+?)['"]\s*,\s*['"](.+?)['"]\)/g;
            let match;
            while ((match = regex.exec(scriptText)) !== null) {
              variables[match[1]] = match[2];
            }
          }
        });
      }
      
      // Variables de ambiente globales
      if (this.data.variable && Array.isArray(this.data.variable)) {
        this.data.variable.forEach(v => {
          if (v.key && v.value !== undefined) {
            variables[v.key] = v.value;
          }
        });
      }
      
      return variables;
    }
  
    /**
     * Obtiene los eventos de la colección (pre-request, tests, etc.)
     * @returns {Array} Eventos de la colección
     */
    getEvents() {
      if (this.data.event && Array.isArray(this.data.event)) {
        return this.data.event;
      }
      return [];
    }
  }
  
  module.exports = {
    PostmanCollection
  };