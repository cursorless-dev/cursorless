import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default {
  files: ["packages/cursorless-org/**/*"],

  extends: [compat.extends("next/core-web-vitals")],

  settings: {
    next: {
      rootDir: "packages/cursorless-org",
    },
  },
};
