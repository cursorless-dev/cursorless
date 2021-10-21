import { SnippetDefinition } from "../typings/snippet";

const defaultSnippetDefinitions: Record<string, SnippetDefinition[]> = {
  ifStatement: [
    {
      scope: {
        langIds: [
          "typescript",
          "typescriptreact",
          "javascript",
          "javascriptreact",
          "cpp",
          "c",
          "java",
          "csharp",
        ],
      },
      body: ["if ($condition) {\n\t$consequence\n}"],
    },
    {
      scope: {
        langIds: ["python"],
      },
      body: ["if $condition:\n\t$consequence"],
    },
  ],
  tryCatchStatement: [
    {
      scope: {
        langIds: [
          "typescript",
          "typescriptreact",
          "javascript",
          "javascriptreact",
          "cpp",
          "c",
          "java",
          "csharp",
        ],
      },
      body: ["try {\n\t$body\n} catch ($error) {\n\t$exceptBody\n}"],
    },
    {
      scope: {
        langIds: ["python"],
      },
      body: ["try:\n\t$body\nexcept $error:\n\t$exceptBody"],
    },
  ],
  ifElseStatement: [
    {
      scope: {
        langIds: [
          "typescript",
          "typescriptreact",
          "javascript",
          "javascriptreact",
          "cpp",
          "c",
          "java",
          "csharp",
        ],
      },
      body: ["if ($condition) {\n\t$consequence\n} else {\n\t$alternative\n}"],
    },
    {
      scope: {
        langIds: ["python"],
      },
      body: ["if $condition:\n\t$consequence\nelse:\n\t$alternative"],
    },
  ],
};

export default defaultSnippetDefinitions;
