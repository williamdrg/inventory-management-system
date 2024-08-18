import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        test: "readonly",
        expect: "readonly"
      },
    },
    rules: {
      // Reglas de estilo personalizadas
      quotes: ["error", "single"], // Usa comillas simples
      indent: ["error", 2],        // Espaciado de 2 espacios
      "no-console": "off",          // Permitir el uso de console.log
      "semi": ["error", "always"],   // Usar punto y coma
      "object-curly-spacing": ["error", "always"], // Espacio dentro de llaves
    },
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
];
