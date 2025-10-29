module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  env: {
    es2021: true,
    worker: true,
  },
  overrides: [
    {
      files: ["src/endpoints/**/*.ts"],
      rules: {
        "no-await-in-loop": "error",
      },
    },
  ],
  ignorePatterns: ["node_modules", "dist", "coverage"],
};
