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

See [test-case-recorder.md](docs/test-case-recorder.md).

### Adding a new programming language

See [docs](docs/adding-a-new-language.md).

### Adding syntactic scope types to an existing language

See [parse-tree-patterns.md](docs/parse-tree-patterns.md).

### Changing SVGs

You'll probably want to run the following to make sure the SVGs have everything they need:

```sh
yarn run compile && node ./out/scripts/preprocessSvgHats.js
```

This script will add dummy width, height and fill attributes as necessary to appease the regex in `Decorations.ts`

While tweaking, the easiest approach is probably to use your settings.json to change size / alignment so you don't need to refresh every time.  Once you're done, you can paste the settings into `addHatAdjustments.ts` and run the following to get your updates:

```sh
yarn run compile && node ./out/scripts/addHatAdjustments.js
```