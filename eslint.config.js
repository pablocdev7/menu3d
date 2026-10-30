// Configuración mínima de ESLint (flat config): reglas recomendadas de JS y TS,
// y eslint-config-prettier para que ESLint no se pelee con Prettier por el formato.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/coverage/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
);
