const js = require('@eslint/js');
const jsdoc = require('eslint-plugin-jsdoc');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  js.configs.recommended,

  // Configuración para archivos del proceso principal y módulos src/
  {
    files: ['main.js', 'preload.js', 'src/**/*.js'],
    plugins: { jsdoc, prettier },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Formato y estilo
      'max-len': [
        'error',
        {
          code: 140,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'array-bracket-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'no-multiple-empty-lines': ['error', { max: 1 }],

      // Buenas prácticas
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      curly: 'error',

      // Complejidad
      complexity: ['warn', 10],
      'max-depth': ['warn', 4],
      'max-params': ['warn', 4],

      // JSDoc
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
          },
        },
      ],
      'jsdoc/require-param': 'warn',
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/require-returns-description': 'warn',

      // Prettier
      'prettier/prettier': 'error',
    },
  },

  // Configuración para el renderer (accede a APIs del navegador)
  {
    files: ['renderer.js'],
    plugins: { jsdoc, prettier },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'max-len': ['error', { code: 140, ignoreUrls: true, ignoreStrings: true }],
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      curly: 'error',
      'prettier/prettier': 'error',
    },
  },

  // Aplicar reglas de prettier al final para desactivar conflictos
  prettierConfig,

  // Ignorar directorios generados
  {
    ignores: ['node_modules/', 'dist/', 'release/', 'coverage/'],
  },
];
