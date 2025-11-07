/** @type {import("eslint").Linter.Config} */
const config = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": true
  },
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks"
  ],
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked"
  ],
  "rules": {
    // TypeScript strict rules for better code quality
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/consistent-type-definitions": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        "prefer": "type-imports",
        "fixStyle": "inline-type-imports"
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }
    ],
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-argument": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        "checksVoidReturn": {
          "attributes": false
        }
      }
    ],

    // Code style and formatting rules
    "indent": "off", // Disabled due to conflicts with Prettier and complex JSX
    "@typescript-eslint/indent": "off", // Use Prettier for indentation instead
    "quotes": ["error", "single", { "avoidEscape": true }],
    "semi": ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    "space-before-blocks": "error",
    "keyword-spacing": "error",
    "comma-spacing": ["error", { "before": false, "after": true }],
    "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
    "space-infix-ops": "error",
    "space-unary-ops": "error",
    "spaced-comment": ["error", "always"],
    "no-trailing-spaces": "error",
    "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1 }],
    "eol-last": ["error", "always"],
    "max-len": ["error", { "code": 120, "ignoreUrls": true, "ignoreStrings": true }],

    // React/JSX rules for cleaner code
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-curly-spacing": ["error", { "when": "never" }],
    "react/jsx-equals-spacing": ["error", "never"],
    "react/jsx-indent": "off", // Disabled due to conflicts with complex JSX
    "react/jsx-indent-props": "off", // Use Prettier for JSX indentation
    "react/jsx-max-props-per-line": ["error", { "maximum": 3 }],
    "react/jsx-first-prop-new-line": ["error", "multiline"],
    "react/jsx-closing-bracket-location": ["error", "tag-aligned"],
    "react/self-closing-comp": ["error", { "component": true, "html": true }]
  },
  "overrides": [
    {
      "files": ["src/app/utils/ui/**/*.tsx", "src/app/utils/ui/**/*.ts"],
      "rules": {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-redundant-type-constituents": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/no-explicit-any": "off"
      }
    },
    {
      "files": ["src/lib/api-client/**/*.ts"],
      "rules": {
        "@typescript-eslint/ban-tslint-comment": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-redundant-type-constituents": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/only-throw-error": "off",
        "max-len": "off"
      }
    }
  ],
  "ignorePatterns": [
    "src/lib/api-client/**/*.gen.ts",
    "src/lib/api-client/client/**/*.ts",
    "src/lib/api-client/core/**/*.ts",
    "src/lib/api-client/@tanstack/**/*.ts"
  ]
}
module.exports = config;