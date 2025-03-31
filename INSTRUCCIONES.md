# Guía de uso: Convertidor Postman a Swagger

## Instalación y Ejecución

### 1. Requisitos previos

Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (versión 14 o superior)
- npm (viene con Node.js)

### 2. Descarga e instalación

1. Descarga o clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/postman-to-swagger.git
   cd postman-to-swagger
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación:
   ```bash
   npm start
   ```

### 3. Generar un ejecutable (opcional)

Si quieres crear un ejecutable para tu sistema operativo:

```bash
npm run package
```

Los archivos ejecutables se generarán en la carpeta `dist/`.

## Uso de la aplicación

### 1. Selección de archivo Postman

1. Inicia la aplicación
2. Haz clic en el botón **"Seleccionar archivo Postman"**
3. Navega y selecciona tu archivo de colección Postman (formato JSON)
4. El contenido de la colección se mostrará en el panel izquierdo

### 2. Conversión

1. Haz clic en el botón **"Convertir"** para procesar la colección
2. El resultado en formato YAML para Swagger/OpenAPI aparecerá en el panel derecho
3. Revisa el panel de logs en la parte inferior para ver mensajes del proceso

### 3. Exportar resultados

Tienes dos opciones para guardar el resultado:

- **Guardar YAML**: Guarda el resultado como un archivo YAML en tu sistema
- **Copiar al portapapeles**: Copia el contenido YAML al portapapeles para pegarlo en otro lugar (como el [Swagger Editor](https://editor.swagger.io/))

## Consejos para la conversión

### Mejores prácticas para tus colecciones Postman

Para obtener mejores resultados en la conversión:

1. **Nombres y descripciones claras**: Usa nombres descriptivos para tus carpetas, requests y parámetros en Postman.

2. **Organización por carpetas**: Organiza tus endpoints en carpetas lógicas, ya que estas se convertirán en tags en Swagger.

3. **Ejemplos de datos**: Incluye ejemplos JSON válidos en los cuerpos de tus solicitudes POST/PUT.

4. **Variables de entorno**: Define las URL base como variables de entorno en Postman.

5. **Parámetros en URL**: Usa la sintaxis `:parametro` en las URLs o define los parámetros de ruta explícitamente.

### Después de la conversión

El archivo YAML generado es un buen punto de partida, pero es recomendable:

1. Revisar y mejorar las descripciones de endpoints y parámetros
2. Ajustar los esquemas generados para mayor precisión
3. Completar las definiciones de respuestas con ejemplos adecuados
4. Añadir información de autenticación si es necesaria

## Solución de problemas

### Problemas comunes

1. **Error al cargar la colección**:
   - Verifica que el archivo sea un JSON válido
   - Asegúrate de que tenga el formato correcto de colección Postman

2. **Rutas incorrectas en el YAML generado**:
   - Verifica cómo están definidas las URLs en tu colección
   - Considera usar variables de entorno para las URL base

3. **Esquemas incompletos o incorrectos**:
   - Los esquemas se infieren de los ejemplos proporcionados
   - Proporciona ejemplos JSON completos y representativos en Postman

### Reportar problemas

Si encuentras errores o tienes sugerencias:

1. Abre un issue en el repositorio de GitHub
2. Incluye detalles sobre el error y cómo reproducirlo
3. Adjunta ejemplos (si es posible) omitiendo información sensible

## Uso con Swagger Editor

Una vez hayas generado el archivo YAML:

1. Visita [Swagger Editor](https://editor.swagger.io/)
2. Haz clic en "File" > "Import File" o simplemente pega el contenido
3. Verás tu API visualizada y podrás seguir editándola

También puedes usar otras herramientas compatibles con OpenAPI como [Redoc](https://redocly.github.io/redoc/) o [Swagger UI](https://swagger.io/tools/swagger-ui/).