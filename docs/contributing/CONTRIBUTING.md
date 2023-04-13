# Contributing

Welcome! So glad you've decided to help make Cursorless better. Once you've
learned how to [set up](#initial-setup) and [run / test a local copy of the
extension](#running--testing-extension-locally), you may want to check out the
[Cursorless API docs](api) to learn more about how Cursorless works. You may also find the [VSCode API docs](https://code.visualstudio.com/api) helpful to learn about VSCode extension development.

## Initial setup

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/installation)
- [VSCode](https://code.visualstudio.com/); minimum version for local development is 1.72.0 in order to support settings profiles for sandboxed development. Please file an issue if that is a problem.

### Steps

1. Clone [`cursorless`](https://github.com/cursorless-dev/cursorless)
2. Open the newly created `cursorless` directory in VSCode. If you're on Windows, don't use WSL (see [#919](https://github.com/cursorless-dev/cursorless/issues/919) for discussion / workaround).
3. Run the following in the terminal:

   ```bash
   pnpm install
   pnpm compile
   ```

4. Run `code --profile=cursorlessDevelopment`, and then close the window that opens (eg say `"window close"`). This step is necessary to create the [VSCode settings profile](https://code.visualstudio.com/updates/v1_72#_settings-profiles) that acts as a sandbox containing a specific set of VSCode extensions that will be run alongside Cursorless when you launch Cursorless in debug or test mode. Once https://github.com/microsoft/vscode/issues/172046 is resolved, we will be able to remove this step, as the profile can then automatically be created.

5. Run the following in the terminal:

   ```bash
   pnpm init-vscode-sandbox
   ```

   The `pnpm init-vscode-sandbox` command creates a local [VSCode settings profile](https://code.visualstudio.com/updates/v1_72#_settings-profiles) that acts as a sandbox containing a specific set of VSCode extensions that will be run alongside Cursorless when you launch Cursorless in debug or test mode. This approach is [suggested](https://code.visualstudio.com/updates/v1_72#_extension-debugging-in-a-clean-environment) by the VSCode documentation. If you'd like to use additional extensions when debugging locally, you can use the following command:

   ```bash
   code --profile=cursorlessDevelopment --install-extension some.extension
   ```

   where `some.extension` is the id of the extension you'd like to install into the sandbox

6. Copy / symlink `cursorless-talon-dev` into your Talon user directory for some useful voice commands for developing Cursorless.

## Running / testing extension locally

In order to test out your local version of the extension or to run unit tests
locally, you need to run the extension in debug mode. To do so you need to run
the `workbench.action.debug.selectandstart` command in VSCode and then select either "Run
Extension" or "Extension Tests".

### Running a subset of tests

The entire test suite takes a little while to run (1-2 mins), so if you'd like to run just a subset of the tests, you can edit the constant in [`runTestSubset`](../../packages/common/src/testUtil/runTestSubset.ts) to a string supported by [mocha grep](https://mochajs.org/#-grep-regexp-g-regexp) and use the "Run Test Subset" launch config instead of the usual "Extension Tests".

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
code --profile=cursorlessDevelopment --install-extension bundle.vsix
```

## Installing a local build of the Cursorless extension

You can install a local build of the Cursorless extension by running the following command:

```bash
pnpm -F cursorless-vscode install-local
```

This will bundle and install a local version of Cursorless, uninstalling production Cursorless first and using a special extension id to break the update chain.

If you don't want to have to check out the PR and do the build yourself, you can
use `install-from-pr` instead, and pass a PR number to the command and it will
download and install the artifact from the PR build. This requires the [`gh`
cli](https://cli.github.com/). For example:

```bash
pnpm -F cursorless-vscode install-from-pr 1281
```

To uninstall the local build and revert to production cursorless, run the following command:

```bash
pnpm -F cursorless-vscode uninstall-local
```

## Changing SVGs

### SVG preprocessing script

You'll probably want to run the following to make sure the SVGs have everything they need:

```sh
pnpm -F @cursorless/cursorless-vscode preprocess-svg-hats
```

This script will add dummy width, height and fill attributes as necessary to appease the regex in `Decorations.ts`

### Adding hat adjustments at finish

While tweaking, the easiest approach is probably to use the
`cursorless.individualHatAdjustments` setting in your settings.json to change
size / alignment so you don't need to refresh every time. Once you're done, you
can paste the settings into `packages/cursorless-vscode/src/scripts/hatAdjustments/add.ts` and run the following to get
your updates:

```sh
pnpm -F @cursorless/cursorless-vscode hat-adjustments-add
```

If instead, you want to average your adjustments with those in main and see the differences to get to yours and main, you can paste the settings into `packages/cursorless-vscode/src/scripts/hatAdjustments/average.ts` and run:

```sh
pnpm -F @cursorless/cursorless-vscode hat-adjustments-average
```
