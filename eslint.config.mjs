import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        process: "readonly",
      },
    },
    rules: {
      // Reglas de estilo personalizadas
      quotes: ["error", "single"], // Usa comillas simples
      indent: ["error", 2],        // Espaciado de 2 espacios
      "no-console": "off",          // Permitir el uso de console.log
      "semi": ["error", "always"],   // Usar punto y coma
    },
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
];
