/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
  ],
  ignorePatterns: [
    "dist",
    ".eslintrc.js",
    "backend/**/*",
    "shanenli_files/**/*",
    "src/components/ui/**/*",
    "src/components/ColumnMappingStep.jsx",
    "src/components/FileUploadZone.jsx",
    "src/components/PreviewStep.jsx",
    "src/components/ProcessingProgress.jsx",
    "src/components/ResultsDisplay.jsx",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["react-refresh"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    // Critical rules
    "no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],

    // React rules
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
    "react-refresh/only-export-components": "off",

    // Disable problematic rules
    "no-useless-catch": "off",
    "no-useless-escape": "off",
  },
};
