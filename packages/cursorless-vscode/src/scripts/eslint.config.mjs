export default [
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "vscode",
              message: "Scripts shouldn't depend on vscode",
            },
          ],
        },
      ],
    },
  },
];
