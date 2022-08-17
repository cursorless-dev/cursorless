# Contributing

Welcome! So glad you've decided to help make Cursorless better. Once you've
learned how to [set up](#initial-setup) and [run / test a local copy of the
extension](#running--testing-extension-locally), you may want to check out the
[Cursorless API docs](api) to learn more about how Cursorless works. You may also find the [VSCode API docs](https://code.visualstudio.com/api) helpful to learn about VSCode extension development.

## Initial setup

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/)

### Steps

1. Clone [`cursorless`](https://github.com/cursorless-dev/cursorless)
2. Open the newly created `cursorless` directory in VSCode
3. Run the following in the terminal:

   ```bash
   yarn
   yarn compile
   yarn init-launch-sandbox
   ```

   The `yarn init-launch-sandbox` command creates a local sandbox containing a specific set of VSCode extensions that will be run alongside Cursorless when you launch Cursorless in debug or test mode. Please file an issue if you'd like to use additional extensions when debugging locally.

## Running / testing extension locally

In order to test out your local version of the extension or to run unit tests
locally, you need to run the extension in debug mode. To do so you need to run
the `workbench.action.debug.selectandstart` command in VSCode and then select either "Run
Extension" or "Extension Tests".

### Running a subset of tests

The entire test suite takes a little while to run (1-2 mins), so if you'd like to run just a subset of the tests, you can edit the constant in [`runTestSubset`](../../src/test/suite/runTestSubset.ts) to a string supported by [mocha grep](https://mochajs.org/#-grep-regexp-g-regexp) and use the "Run Test Subset" launch config instead of the usual "Extension Tests".

## Code formatting

We use [`pre-commit`](https://pre-commit.com/) to automate autoformatting.
Autoformatters will automatically run on PRs in CI, but you can also run them
locally or install pre-commit hooks as described in the
[`pre-commit` documentation](https://pre-commit.com/).

## Running docs site locally

Run the `workbench.action.debug.selectandstart` command and then select
"Docusaurus Start (Debug)".

## Adding tests

See [test-case-recorder.md](./test-case-recorder.md).

## Parse tree support

### Adding a new programming language

See [docs](./adding-a-new-language.md).

### Adding syntactic scope types to an existing language

See [parse-tree-patterns.md](./parse-tree-patterns.md).

### Testing Cursorless with a local version of the VSCode parse tree extension

First bundle the parse tree extension into a `.vsix`, using something like the following:

```
cd ../vscode-parse-tree
vsce package -o bundle.vsix
```

Once you have your package then you can install it into the sandbox using the following command:

```
cd ../cursorless
code --extensions-dir .vscode-sandbox/extensions --install-extension ../vscode-parse-tree/bundle.vsix
```

## Changing SVGs

### SVG preprocessing script

You'll probably want to run the following to make sure the SVGs have everything they need:

```sh
yarn run compile && node ./out/scripts/preprocessSvgHats.js
```

This script will add dummy width, height and fill attributes as necessary to appease the regex in `Decorations.ts`

### Adding hat adjustments at finish

While tweaking, the easiest approach is probably to use the
`cursorless.individualHatAdjustments` setting in your settings.json to change
size / alignment so you don't need to refresh every time. Once you're done, you
can paste the settings into `scripts/hatAdjustments/add.ts` and run the following to get
your updates:

```sh
yarn run compile && node ./out/scripts/hatAdjustments/add.js
```

If instead, you want to average your adjustments with those in main and see the differences to get to yours and main, you can paste the settings into `scripts/hatAdjustments/average.ts` and run:

```sh
yarn run compile && node ./out/scripts/hatAdjustments/average.js
```
