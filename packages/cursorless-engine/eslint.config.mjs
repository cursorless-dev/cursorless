export default [
  {
    files: ["**/*.ts"],
    ignores: ["src/scripts/**", "src/testUtil/**", "**/*.test.ts"],

    rules: {
      "import/no-nodejs-modules": "error",
    },
  },
];
