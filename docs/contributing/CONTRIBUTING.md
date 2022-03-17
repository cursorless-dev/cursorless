# Contributing

Welcome! So glad you've decided to help make Cursorless better. Once you've Learned how to [install](#installation) and [run / test a local copy of the extension](#running--testing-extension-locally), you may want to check out the [API docs](api) to learn more about how Cursorless works.

### Installation

```sh
yarn
```

### Running / testing extension locally

In order to test out your local version of the extension or to run unit tests locally you need to run the extension in debug mode. To do so you need to run the `workbench.action.debug.selectandstart` command and then select either "Run Extension" or "Extension Tests".

### Adding tests

See [test-case-recorder.md](./test-case-recorder.md).

### Adding a new programming language

See [docs](./adding-a-new-language.md).

### Adding syntactic scope types to an existing language

See [parse-tree-patterns.md](./parse-tree-patterns.md).

### Changing SVGs

#### SVG preprocessing script

You'll probably want to run the following to make sure the SVGs have everything they need:

```sh
yarn run compile && node ./out/scripts/preprocessSvgHats.js
```

This script will add dummy width, height and fill attributes as necessary to appease the regex in `Decorations.ts`

#### Adding hat adjustments at finish

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
