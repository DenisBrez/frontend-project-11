/* eslint-disable */
import globals from "globals";

import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";
import babelParser from "@babel/eslint-parser";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({baseDirectory: __dirname, recommendedConfig: pluginJs.configs.recommended});

export default [
  {
    ignores: ["dist/index.js", "eslint.config.js", "webpack.config.cjs"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Добавляем browser globals (document, window и т.д.)
        ...globals.node
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-env"],
        },
      },
    },
  },
  ...compat.extends("airbnb"),
  {
    rules: {
      "import/extensions": ["error", "ignorePackages"],
      "no-param-reassign": ["error", { "props": false }],
      'no-console': 'off'
    }
  }
];