# PostmanToSwagger

Una aplicación de escritorio elegante y eficiente que convierte colecciones de Postman a formato YAML para Swagger/OpenAPI 3.0. Simplifica la documentación de APIs transformando tus colecciones de Postman existentes en especificaciones OpenAPI compatibles con Swagger Editor.

## ✨ Características

- 🔄 **Conversión intuitiva**: Transforma colecciones Postman (.json) a YAML OpenAPI 3.0 con un solo clic
- 👁️ **Vista previa en tiempo real**: Visualiza el JSON de entrada y el YAML de salida en la misma interfaz
- 📁 **Gestión de archivos sencilla**: Carga y guarda archivos fácilmente con la interfaz nativa
- 📋 **Copia rápida**: Copia el YAML generado al portapapeles para usarlo en Swagger Editor
- 🔍 **Inferencia inteligente**: Genera automáticamente esquemas a partir de ejemplos JSON
- 📊 **Registro detallado**: Visualiza el progreso y los resultados del proceso de conversión

## 🚀 Instalación

### Opción 1: Descargar ejecutable

Descarga el instalador apropiado para tu sistema operativo desde la sección de [releases](https://github.com/cmurestudillos/postman-to-swagger-converter/releases).

### Opción 2: Construir desde el código fuente

```bash
# Clonar el repositorio
git clone https://github.com/cmurestudillos/postman-to-swagger-converter.git
cd postman-to-swagger-converter

# Instalar dependencias
pnpm install

# Iniciar la aplicación
pnpm start

# Crear ejecutable (opcional — elige tu plataforma)
pnpm run package:win   # Windows
pnpm run package:mac   # macOS
pnpm run package:linux # Linux
```

## 🖥️ Uso

1. **Seleccionar archivo**: Haz clic en "Seleccionar archivo Postman" para cargar tu colección (.json)
2. **Convertir**: Presiona el botón "Convertir" para generar el YAML de OpenAPI
3. **Verificar**: Revisa el resultado generado en el panel derecho
4. **Exportar**: Guarda el resultado como archivo YAML o cópialo al portapapeles
5. **Utilizar**: Importa el YAML en [Swagger Editor](https://editor.swagger.io/) o en tu herramienta preferida de OpenAPI

## 📘 Guía para mejores resultados

Para obtener conversiones óptimas, se recomienda:

- **Organizar en carpetas** tus endpoints en Postman (se convertirán en tags en OpenAPI)
- **Usar nombres descriptivos** para tus requests
- **Incluir ejemplos** en los cuerpos de tus requests POST/PUT
- **Definir variables de entorno** para las URLs base
- **Documentar tus endpoints** con descripciones en Postman

## 🛠️ Tecnologías utilizadas

- [Electron](https://www.electronjs.org/) - Framework para apps de escritorio
- [js-yaml](https://github.com/nodeca/js-yaml) - Conversión JSON/YAML
- [Lodash](https://lodash.com/) - Utilidades JavaScript
- [Node.js](https://nodejs.org/) - Entorno de ejecución

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Primero abre un issue para discutir qué te gustaría cambiar
2. Haz fork del repositorio
3. Crea una nueva rama (`git checkout -b feature/amazing-feature`)
4. Haz commit de tus cambios (`git commit -m 'feat: añadir funcionalidad asombrosa'`)
5. Haz push a la rama (`git push origin feature/amazing-feature`)
6. Abre un Pull Request

## 📋 Tareas pendientes

- [ ] Añadir editor integrado para modificar el YAML generado
- [ ] Integrar vista previa con Swagger UI
- [ ] Soportar autenticación y cabeceras complejas
- [ ] Añadir opciones de personalización del formato
- [ ] Implementar validación del YAML generado
- [ ] Conversión inversa (de OpenAPI a Postman)

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [Postman](https://www.postman.com/) por su increíble herramienta para APIs
- [OpenAPI Initiative](https://www.openapis.org/) por el estándar OpenAPI
- [Swagger](https://swagger.io/) por sus herramientas de documentación de APIs