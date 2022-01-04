<h1 align="center">Welcome to Cursorless!</h1>
<p align="center">
  <a href="https://github.com/pokey/cursorless-vscode/blob/main/CHANGELOG.md" target="_blank">
    <img alt="Version" src="https://img.shields.io/github/package-json/v/pokey/cursorless-vscode?color=blue" />
  </a>
  <a href="https://github.com/pokey/cursorless-vscode/actions/workflows/test.yml?query=branch%3Amain" target="_blank">
    <img alt="Tests" src="https://img.shields.io/github/workflow/status/pokey/cursorless-vscode/Run%20Tests?logo=github&label=tests" />
  </a>
  <a href="https://github.com/pokey/cursorless-talon/tree/main/docs" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/pokey/cursorless-vscode/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/maintenance/yes/2022.svg" />
  </a>
  <a href="https://github.com/pokey/cursorless-vscode/blob/main/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/pokey/cursorless-vscode" />
  </a>
</p>

Cursorless is a spoken language for structural code editing, enabling developers to code by voice at speeds not possible with a keyboard. Cursorless decorates every token on the screen and defines a spoken language for rapid, high-level semantic manipulation of structured text.

Checkout the [docs](https://github.com/pokey/cursorless-talon/blob/main/docs) and [videos](https://www.youtube.com/channel/UCML02pamUSxtbwAcrUdVmXg) to learn more. See [cursorless-talon](https://github.com/pokey/cursorless-talon) for installation instructions.

And I heard you like GIFs?

![Curly repack ox](images/curlyRepackOx.gif)
![Move arg air and each to after drum](images/moveArgAirAndEachToAfterDrum.gif)
![Chuck tail red pipe slice past end of file](images/chuckTailRedPipeSlicePastEndOfFile.gif)

## Installation

Currently depends on [Talon](https://talonvoice.com/), though a keyboard
version is planned.

See [cursorless-talon](https://github.com/pokey/cursorless-talon) for installation instructions.

## Extension Settings

This extension contributes the following settings:

- `cursorless.showOnStart`: Whether decorations should appear on workspace start
- `cursorless.hatSizeAdjustment`: Percentage to increase or decrease hat size; positive increases size
- `cursorless.hatVerticalOffset`: How much to vertically shift the hats as a percentage of font size; positive is up
- `cursorless.hatEnablement.colors`: Whether to enable particular hat colors.
- `cursorless.hatEnablement.shapes`: Whether to enable particular hat shapes.
- `cursorless.hatPenalties.colors`: How much to penalize each hat color. You will probably want to set this one to the number of syllables in the given style. Cursorless will then sort every style combination by number of syllables to refer to it.
- `cursorless.hatPenalties.shapes`: How much to penalize each hat shape. You will probably want to set this one to the number of syllables in the given style. Cursorless will then sort every style combination by number of syllables to refer to it.

## Known Issues

- Cursorless calculates the position of the hats based on the characteristics of your font. If you find that the hats are off center you can try running this command: `cursorless.recomputeDecorationStyles`

## Change Log

See [CHANGELOG.md](CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

_This README was partially generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
