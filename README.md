# Postman a Swagger Converter

Una aplicación de escritorio para convertir colecciones de Postman a formato YAML para Swagger/OpenAPI.

## Características

- Interfaz de usuario sencilla e intuitiva
- Carga de colecciones Postman en formato JSON
- Conversión automática a formato YAML para Swagger/OpenAPI 3.0
- Previsualización de JSON de entrada y YAML de salida
- Guardado del archivo YAML generado
- Copia del YAML al portapapeles
- Registro de operaciones

## Instalación

### Requisitos previos

- Node.js (versión 14 o superior)
- npm o yarn

### Instalar dependencias

```bash
# Usando npm
npm install

# Usando yarn
yarn install
```

### Iniciar la aplicación en modo desarrollo

```bash
# Usando npm
npm start

# Usando yarn
yarn start
```

### Crear ejecutable para distribución

```bash
# Usando npm
npm run package

# Usando yarn
yarn package
```

Los archivos ejecutables se generarán en la carpeta `dist`.

## Uso

1. Inicia la aplicación
2. Haz clic en "Seleccionar archivo Postman" para elegir tu colección de Postman (.json)
3. Revisa el contenido JSON
4. Haz clic en "Convertir" para generar el YAML de Swagger
5. Revisa el YAML generado
6. Utiliza "Guardar YAML" para guardar el archivo o "Copiar al portapapeles" para copiarlo

## Estructura del proyecto

```
project-root/
├── package.json             // Configuración del proyecto
├── main.js                  // Punto de entrada principal de Electron
├── preload.js               // Script de precarga para comunicación segura
├── index.html               // Interfaz de usuario principal
├── styles.css               // Estilos de la aplicación
├── renderer.js              // Lógica de la interfaz
└── src/
    ├── converter.js         // Lógica de conversión de Postman a Swagger
    ├── models/              // Modelos para representar estructuras de datos
    │   ├── PostmanCollection.js
    │   └── SwaggerDocument.js
    └── utils/               // Utilidades
        ├── fileUtils.js     // Manejo de archivos
        └── yamlUtils.js     // Funciones para trabajar con YAML
```

## Cómo funciona

La aplicación realiza los siguientes pasos para convertir una colección de Postman a Swagger:

1. **Carga y análisis**: Carga el archivo JSON de la colección Postman y lo analiza en un objeto JavaScript.

2. **Extracción de información**:
   - Extrae información básica (título, descripción)
   - Identifica las variables de entorno (como URLs base)
   - Procesa las carpetas/grupos como tags en Swagger
   - Analiza cada endpoint, extrayendo método, ruta, parámetros y cuerpo

3. **Generación de estructura OpenAPI**:
   - Crea la estructura básica del documento OpenAPI 3.0
   - Configura la información general y servidores
   - Genera las definiciones de rutas (paths)
   - Infiere esquemas a partir de ejemplos JSON
   - Organiza endpoints por etiquetas

4. **Conversión a YAML**:
   - Convierte la estructura del documento a formato YAML
   - Aplica formato adecuado para legibilidad

5. **Exportación**:
   - Permite guardar el resultado como archivo YAML
   - Ofrece opción de copiar al portapapeles

## Limitaciones

- La aplicación infiere los esquemas a partir de ejemplos, por lo que pueden no ser 100% precisos
- Las descripciones de parámetros y respuestas son genéricas si no están definidas en Postman
- Las características avanzadas de OpenAPI (como discriminadores, oneOf, allOf) no se generan automáticamente
- Las respuestas se generan con códigos estándar (200, 400, 401, 404, 500)

## Desarrollo

### Añadir nuevas características

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Realiza tus cambios
4. Prueba la aplicación: `npm start`
5. Crea un ejecutable: `npm run package`

### Pruebas

Ejecuta las pruebas con:

```bash
npm test
```

## Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu característica: `git checkout -b nueva-caracteristica`
3. Haz commit de tus cambios: `git commit -m 'Añade nueva característica'`
4. Haz push a la rama: `git push origin nueva-caracteristica`
5. Envía un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.