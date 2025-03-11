export default [
  {
    files: ["**/*.ts"],
    ignores: ["**/*.test.ts"],

    rules: {
      "import/no-nodejs-modules": "error",
    },
  },
];
