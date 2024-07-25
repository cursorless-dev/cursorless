# Tests

Tests are critical to Cursorless. We do not consider a bug fixed or feature added until there is a test (with an exception if writing the test is unreasonably difficult, in which case we'll usually file an issue to track adding a test).

Our tests fall broadly into three categories:

- **Recorded tests** are end-to-end / subcutaneous tests that run a full Cursorless command and check that the ide ends up in the correct state. These represent the bulk of our tests, and are generated automatically using the [test case recorder](./test-case-recorder.md).
- **Scope tests** check that Cursorless scopes are defined correctly for all languages that support the given scope. They consist of a small test document followed by `---`, and then a snapshot of the expected scopes in the given document. They are generated automatically using our [scope test recorder](./adding-a-new-scope.md#4-add-tests-for-the-given-scope).
- **Other tests** include unit tests, handwritten subcutaneous / end-to-end tests, etc

We run the above tests in various contexts, both locally and in CI. The contexts are:

- **VSCode**: Today, many of our tests must run within a VSCode context. For some of our tests, this is desirable, because they are designed to test that our code works in VSCode. However, many of our tests (such as scope tests and recorded tests) are not really VSCode-specific, but we haven't yet built the machinery to run them in a more isolated context, which would be much faster.
- **Unit tests**: Many of our tests can run in a neutral context, without requiring an actual IDE with editors, etc. Most of these are unit tests in the traditional sense of the word, testing the logic of a small unit of code, such as a function.
- **Talon**: For each of our recorded tests, we test that saying the spoken form of the command in Talon results in the command payload that we expect. Note that these tests can only be run locally today.
- **Neovim**: We run a subset of our recorded tests within Neovim to ensure that the given subset of Cursorless works within Neovim. We also have a few lua unit tests that must be run in Neovim. These test the lua functions that Cursorless needs in order to interact with Neovim. To learn more about our Neovim test infrastructure, see [Neovim test infrastructure](./architecture/neovim-test-infrastructure.md).

You can get an overview of the various test contexts that exist locally by looking at our VSCode launch configs, which include not only our VSCode tests, but all of our tests.
