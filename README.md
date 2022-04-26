<h1 align="center">Welcome to Cursorless!</h1>
<p align="center">
  <a href="https://github.com/cursorless-dev/cursorless/blob/main/CHANGELOG.md" target="_blank">
    <img alt="Version" src="https://img.shields.io/github/package-json/v/cursorless-dev/cursorless-vscode?color=blue&logoColor=white&logo=data:image/svg%2bxml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhcyIgZGF0YS1pY29uPSJjb2RlLWJyYW5jaCIgY2xhc3M9InN2Zy1pbmxpbmUtLWZhIGZhLWNvZGUtYnJhbmNoIGZhLXctMTIiIHJvbGU9ImltZyIKICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDM4NCA1MTIiPgogICAgPHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0zODQgMTQ0YzAtNDQuMi0zNS44LTgwLTgwLTgwcy04MCAzNS44LTgwIDgwYzAgMzYuNCAyNC4zIDY3LjEgNTcuNSA3Ni44LS42IDE2LjEtNC4yIDI4LjUtMTEgMzYuOS0xNS40IDE5LjItNDkuMyAyMi40LTg1LjIgMjUuNy0yOC4yIDIuNi01Ny40IDUuNC04MS4zIDE2Ljl2LTE0NGMzMi41LTEwLjIgNTYtNDAuNSA1Ni03Ni4zIDAtNDQuMi0zNS44LTgwLTgwLTgwUzAgMzUuOCAwIDgwYzAgMzUuOCAyMy41IDY2LjEgNTYgNzYuM3YxOTkuM0MyMy41IDM2NS45IDAgMzk2LjIgMCA0MzJjMCA0NC4yIDM1LjggODAgODAgODBzODAtMzUuOCA4MC04MGMwLTM0LTIxLjItNjMuMS01MS4yLTc0LjYgMy4xLTUuMiA3LjgtOS44IDE0LjktMTMuNCAxNi4yLTguMiA0MC40LTEwLjQgNjYuMS0xMi44IDQyLjItMy45IDkwLTguNCAxMTguMi00My40IDE0LTE3LjQgMjEuMS0zOS44IDIxLjYtNjcuOSAzMS42LTEwLjggNTQuNC00MC43IDU0LjQtNzUuOXpNODAgNjRjOC44IDAgMTYgNy4yIDE2IDE2cy03LjIgMTYtMTYgMTYtMTYtNy4yLTE2LTE2IDcuMi0xNiAxNi0xNnptMCAzODRjLTguOCAwLTE2LTcuMi0xNi0xNnM3LjItMTYgMTYtMTYgMTYgNy4yIDE2IDE2LTcuMiAxNi0xNiAxNnptMjI0LTMyMGM4LjggMCAxNiA3LjIgMTYgMTZzLTcuMiAxNi0xNiAxNi0xNi03LjItMTYtMTYgNy4yLTE2IDE2LTE2eiI+PC9wYXRoPgo8L3N2Zz4=" />
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=pokey.cursorless&ssr=false#review-details" target="_blank">
    <img alt="Rating" src="https://img.shields.io/visual-studio-marketplace/stars/pokey.cursorless?logo=visualstudiocode" />
  </a>
  <a href="https://github.com/cursorless-dev/cursorless/actions/workflows/test.yml?query=branch%3Amain" target="_blank">
    <img alt="Tests" src="https://img.shields.io/github/workflow/status/cursorless-dev/cursorless-vscode/Run%20Tests?logo=github&label=tests" />
  </a>
  <a href="https://www.cursorless.org/docs/" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg?logo=data:image/svg%2bxml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhcyIgZGF0YS1pY29uPSJib29rIiBjbGFzcz0ic3ZnLWlubGluZS0tZmEgZmEtYm9vayBmYS13LTE0IiByb2xlPSJpbWciCiAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj4KICAgIDxwYXRoIGZpbGw9IndoaXRlIiBkPSJNNDQ4IDM2MFYyNGMwLTEzLjMtMTAuNy0yNC0yNC0yNEg5NkM0MyAwIDAgNDMgMCA5NnYzMjBjMCA1MyA0MyA5NiA5NiA5NmgzMjhjMTMuMyAwIDI0LTEwLjcgMjQtMjR2LTE2YzAtNy41LTMuNS0xNC4zLTguOS0xOC43LTQuMi0xNS40LTQuMi01OS4zIDAtNzQuNyA1LjQtNC4zIDguOS0xMS4xIDguOS0xOC42ek0xMjggMTM0YzAtMy4zIDIuNy02IDYtNmgyMTJjMy4zIDAgNiAyLjcgNiA2djIwYzAgMy4zLTIuNyA2LTYgNkgxMzRjLTMuMyAwLTYtMi43LTYtNnYtMjB6bTAgNjRjMC0zLjMgMi43LTYgNi02aDIxMmMzLjMgMCA2IDIuNyA2IDZ2MjBjMCAzLjMtMi43IDYtNiA2SDEzNGMtMy4zIDAtNi0yLjctNi02di0yMHptMjUzLjQgMjUwSDk2Yy0xNy43IDAtMzItMTQuMy0zMi0zMiAwLTE3LjYgMTQuNC0zMiAzMi0zMmgyODUuNGMtMS45IDE3LjEtMS45IDQ2LjkgMCA2NHoiPjwvcGF0aD4KPC9zdmc+" />
  </a>
  <a href="https://github.com/cursorless-dev/cursorless/graphs/contributors" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/maintenance/yes/2022.svg?logo=data:image/svg%2bxml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhcyIgZGF0YS1pY29uPSJ3cmVuY2giIGNsYXNzPSJzdmctaW5saW5lLS1mYSBmYS13cmVuY2ggZmEtdy0xNiIgcm9sZT0iaW1nIgogICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+CiAgICA8cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTUwNy43MyAxMDkuMWMtMi4yNC05LjAzLTEzLjU0LTEyLjA5LTIwLjEyLTUuNTFsLTc0LjM2IDc0LjM2LTY3Ljg4LTExLjMxLTExLjMxLTY3Ljg4IDc0LjM2LTc0LjM2YzYuNjItNi42MiAzLjQzLTE3LjktNS42Ni0yMC4xNi00Ny4zOC0xMS43NC05OS41NS45MS0xMzYuNTggMzcuOTMtMzkuNjQgMzkuNjQtNTAuNTUgOTcuMS0zNC4wNSAxNDcuMkwxOC43NCA0MDIuNzZjLTI0Ljk5IDI0Ljk5LTI0Ljk5IDY1LjUxIDAgOTAuNSAyNC45OSAyNC45OSA2NS41MSAyNC45OSA5MC41IDBsMjEzLjIxLTIxMy4yMWM1MC4xMiAxNi43MSAxMDcuNDcgNS42OCAxNDcuMzctMzQuMjIgMzcuMDctMzcuMDcgNDkuNy04OS4zMiAzNy45MS0xMzYuNzN6TTY0IDQ3MmMtMTMuMjUgMC0yNC0xMC43NS0yNC0yNCAwLTEzLjI2IDEwLjc1LTI0IDI0LTI0czI0IDEwLjc0IDI0IDI0YzAgMTMuMjUtMTAuNzUgMjQtMjQgMjR6Ij48L3BhdGg+Cjwvc3ZnPg==" />
  </a>
  <a href="https://github.com/cursorless-dev/cursorless/blob/main/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/cursorless-dev/cursorless-vscode?color=success&logo=data:image/svg%2bxml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhcyIgZGF0YS1pY29uPSJiYWxhbmNlLXNjYWxlIiBjbGFzcz0ic3ZnLWlubGluZS0tZmEgZmEtYmFsYW5jZS1zY2FsZSBmYS13LTIwIiByb2xlPSJpbWciCiAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNTEyIj4KICAgIDxwYXRoIGZpbGw9IndoaXRlIiBkPSJNMjU2IDMzNmgtLjAyYzAtMTYuMTggMS4zNC04LjczLTg1LjA1LTE4MS41MS0xNy42NS0zNS4yOS02OC4xOS0zNS4zNi04NS44NyAwQy0yLjA2IDMyOC43NS4wMiAzMjAuMzMuMDIgMzM2SDBjMCA0NC4xOCA1Ny4zMSA4MCAxMjggODBzMTI4LTM1LjgyIDEyOC04MHpNMTI4IDE3Nmw3MiAxNDRINTZsNzItMTQ0em01MTEuOTggMTYwYzAtMTYuMTggMS4zNC04LjczLTg1LjA1LTE4MS41MS0xNy42NS0zNS4yOS02OC4xOS0zNS4zNi04NS44NyAwLTg3LjEyIDE3NC4yNi04NS4wNCAxNjUuODQtODUuMDQgMTgxLjUxSDM4NGMwIDQ0LjE4IDU3LjMxIDgwIDEyOCA4MHMxMjgtMzUuODIgMTI4LTgwaC0uMDJ6TTQ0MCAzMjBsNzItMTQ0IDcyIDE0NEg0NDB6bTg4IDEyOEgzNTJWMTUzLjI1YzIzLjUxLTEwLjI5IDQxLjE2LTMxLjQ4IDQ2LjM5LTU3LjI1SDUyOGM4Ljg0IDAgMTYtNy4xNiAxNi0xNlY0OGMwLTguODQtNy4xNi0xNi0xNi0xNkgzODMuNjRDMzY5LjA0IDEyLjY4IDM0Ni4wOSAwIDMyMCAwcy00OS4wNCAxMi42OC02My42NCAzMkgxMTJjLTguODQgMC0xNiA3LjE2LTE2IDE2djMyYzAgOC44NCA3LjE2IDE2IDE2IDE2aDEyOS42MWM1LjIzIDI1Ljc2IDIyLjg3IDQ2Ljk2IDQ2LjM5IDU3LjI1VjQ0OEgxMTJjLTguODQgMC0xNiA3LjE2LTE2IDE2djMyYzAgOC44NCA3LjE2IDE2IDE2IDE2aDQxNmM4Ljg0IDAgMTYtNy4xNiAxNi0xNnYtMzJjMC04Ljg0LTcuMTYtMTYtMTYtMTZ6Ij48L3BhdGg+Cjwvc3ZnPg==" />
  </a>
</p>

Cursorless is a spoken language for structural code editing, enabling developers to code by voice at speeds not possible with a keyboard. Cursorless decorates every token on the screen and defines a spoken language for rapid, high-level semantic manipulation of structured text.

Checkout the [docs](https://www.cursorless.org/docs/) and [videos](https://www.youtube.com/channel/UCML02pamUSxtbwAcrUdVmXg) to learn more. See [installation](https://www.cursorless.org/docs/user/installation/) for installation instructions.

And I heard you like GIFs?

![Curly repack ox](images/curlyRepackOx.gif)
![Move arg air and each to after drum](images/moveArgAirAndEachToAfterDrum.gif)
![Chuck tail red pipe slice past end of file](images/chuckTailRedPipeSlicePastEndOfFile.gif)

## Installation

Currently depends on [Talon](https://talonvoice.com/), though a keyboard
version is planned.

See [installation](https://www.cursorless.org/docs/user/installation/) for installation instructions.

## Extension Settings

This extension contributes the following settings:

- `cursorless.showOnStart`: Whether decorations should appear on workspace start
- `cursorless.hatSizeAdjustment`: Percentage to increase or decrease hat size; positive increases size
- `cursorless.hatVerticalOffset`: How much to vertically shift the hats as a percentage of font size; positive is up
- `cursorless.hatEnablement.colors`: Whether to enable particular hat colors.
- `cursorless.hatEnablement.shapes`: Whether to enable particular hat shapes.
- `cursorless.hatPenalties.colors`: How much to penalize each hat color. You will probably want to set this one to the number of syllables in the given style. Cursorless will then sort every style combination by number of syllables to refer to it.
- `cursorless.hatPenalties.shapes`: How much to penalize each hat shape. You will probably want to set this one to the number of syllables in the given style. Cursorless will then sort every style combination by number of syllables to refer to it.
- `cursorless.maximumHatStylePenalty`: The maximum allowed penalty for a hat style. Any hat style whose penalty is greater than this amount will not be used. A hat style penalty is defined to be the shape penalty plus the colour penalty. Setting this value less than or equal to zero is treated as no maximum.

## Known Issues

- Cursorless calculates the position of the hats based on the characteristics of your font. If you find that the hats are off center you can try running this command: `cursorless.recomputeDecorationStyles`

## Contributing

See [contributing](https://www.cursorless.org/docs/contributing/).

## Change Log

See [CHANGELOG.md](CHANGELOG.md).

## Attributions

See [NOTICE.md](NOTICE.md).
