# Test harness

This package contains the machinery used to test Cursorless, both in CI and locally, across various contexts (eg VSCode, Talon, Neovim, unit tests). Note that it does not actually contain any tests itself; those are either embedded in `.test.ts` files either next to the code they're testing or in standalone `*-e2e` packages.

This package bundles tests into `.mjs` files and includes scripts used to run tests.

Note that we currently have a hack where the `package.json` here appears as if it is only used for Neovim. That is because none of our other test runners require a `package.json`, so they are happy to ignore fields such as `main` and `types` that are required for Neovim to be able to import the test harness. See [#2564](https://github.com/cursorless-dev/cursorless/issues/2564) to track progress on a more elegant solution.
