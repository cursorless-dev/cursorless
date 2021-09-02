<h1 align="center">Welcome to Cursorless!</h1>
<p align="center">
  <a href="https://github.com/pokey/cursorless-vscode/blob/master/CHANGELOG.md" target="_blank">
    <img alt="Version" src="https://img.shields.io/github/package-json/v/pokey/cursorless-vscode?color=blue" />
  </a>
  <a href="https://github.com/pokey/cursorless-vscode/actions/workflows/test.yml?query=branch%3Amaster" target="_blank">
    <img alt="Tests" src="https://img.shields.io/github/workflow/status/pokey/cursorless-vscode/Run%20Tests?logo=github&label=tests" />
  </a>
  <a href="https://github.com/pokey/cursorless-talon/tree/master/docs" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/pokey/cursorless-vscode/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/maintenance/yes/2021.svg" />
  </a>
  <a href="https://github.com/pokey/cursorless-vscode/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/pokey/cursorless-vscode" />
  </a>
</p>

> Allows cursorless editing and rapid navigation by decorating a single letter from each token.

## Features

![swap](images/swap.gif)
![main-demo](images/main-demo.gif)
![demo-2](images/demo-2.gif)
![demo-3](images/demo-3.gif)

Checkout the [docs](https://github.com/pokey/cursorless-talon/blob/master/docs), [tutorial video](https://www.youtube.com/watch?v=JxcNW0hnfTk) and [!!con talk](https://www.youtube.com/watch?v=Py9xjeIhxOg) to get started.

## Installation

Currently depends on [Talon](https://talonvoice.com/), though a keyboard
version is planned.

See [cursorless-talon](https://github.com/pokey/cursorless-talon) for installation instructions.

## Extension Settings

This extension contributes the following settings:

- `cursorless.showOnStart`: Whether decorations should appear on workspace start
- `cursorless.hatSizeAdjustment`: Percentage to increase or decrease hat size; positive increases size
- `cursorless.hatVerticalOffset`: How much to vertically shift the hats as a percentage of font size; positive is up
- `cursorless.<hatStyle>.enabled`: Whether to enable `<hatStyle>` shape / color.
- `cursorless.<hatStyle>.penalty`: How much to penalize the `<hatStyle>` shape / color. You will probably want to set this one to the number of syllables in the given style. Cursorless will then sort every style combination by number of syllables to refer to it.

## Known Issues

- Cursorless calculates the position of the hats based on the characteristics of your font. If you find that the hats are off center you can try running this command: `cursorless.recomputeDecorationStyles`

## Change Log

See [CHANGELOG.md](CHANGELOG.md).

## Contributing

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

---

_This README was partially generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
