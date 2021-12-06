# Contributing

### Installation

```sh
yarn install
```

### Running tests

```sh
yarn run test
```

### Adding tests

See [test-case-recorder.md](docs/contributing/test-case-recorder.md).

### Adding a new programming language

See [docs](docs/contributing/adding-a-new-language.md).

### Adding syntactic scope types to an existing language

See [parse-tree-patterns.md](docs/contributing/parse-tree-patterns.md).

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
