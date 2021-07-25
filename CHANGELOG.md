# Change Log

All notable changes to the "cursorless" extension will be documented in this file.

## 0.20.0 (24 July 2021)
### Enhancements

- C\# support [\#137](https://github.com/pokey/cursorless-vscode/pull/137) ([sterlind](https://github.com/sterlind))
- Added action duplicate [\#134](https://github.com/pokey/cursorless-vscode/pull/134) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added support to exclude start or end token in ranges [\#131](https://github.com/pokey/cursorless-vscode/pull/131) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added action set breakpoint [\#130](https://github.com/pokey/cursorless-vscode/pull/130) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Fixed bug with two adjacent tokens [\#129](https://github.com/pokey/cursorless-vscode/pull/129) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added selection type paragraph [\#125](https://github.com/pokey/cursorless-vscode/pull/125) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- implemented actions puff, float, drop [\#122](https://github.com/pokey/cursorless-vscode/pull/122) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Subtokens support reversed order ordinals [\#121](https://github.com/pokey/cursorless-vscode/pull/121) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- added find all action [\#120](https://github.com/pokey/cursorless-vscode/pull/120) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Infer missing end mark on ranges [\#118](https://github.com/pokey/cursorless-vscode/pull/118) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added actions: indent, dedent, comment [\#116](https://github.com/pokey/cursorless-vscode/pull/116) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Implemented paste action [\#115](https://github.com/pokey/cursorless-vscode/pull/115) ([AndreasArvidsson](https://github.com/AndreasArvidsson))


### Bugs fixed

- Improved error message ensureSingleEditor [\#133](https://github.com/pokey/cursorless-vscode/pull/133) ([AndreasArvidsson](https://github.com/AndreasArvidsson))

### Code quality
- Added function listenForDocumentChanges [\#126](https://github.com/pokey/cursorless-vscode/pull/126) ([AndreasArvidsson](https://github.com/AndreasArvidsson))

## 0.19.0 (16 July 2021)
### Enhancements
- Support "move", "bring to after" / "move to after", and properly cleaning up spaces / newlines on delete

## 0.18.0 (12 July 2021)
### Enhancements
- Add support for untrusted workspaces ([#104](https://github.com/pokey/cursorless-vscode/pull/104))

## 0.17.0 (9 July 2021)
### Documentation
- Add cheatsheet (`"cursorless help"`) [cursorless-talon#1](https://github.com/pokey/cursorless-talon/pull/1)

## 0.16.0 (9 July 2021)

### Enhancements
- Svg Hats (#66)
- Add type modifier (#32)
- Updated regexp to support fixed tokens and sequential symbols (#33)
- Add name modifier (#56)
- Added actions to scroll target top/center (#58)

### Fixes
- Fix subword for all caps tokens (#67)

## 0.15.0
- Support "character" subtoken modifier (eg "take fine third character") (thanks @brxck!)

## 0.14.0

- Support `insertLineBefore` and `insertLineAfter` actions ("drink" and "pour")

## 0.13.0

- Support "file" selection type to refer to the entire file
- Improve error messages

## 0.12.0

- Add subword support
- [python] Fix parameter modifier
- Show exceptions to user
- Properly support using "token" to select only token, eg "take funk gust and
  token fine" to prevent "fine" from being inferred to have the `function`
  modifier.
- Support "bring" action to use another target from elsewhere in the document

## 0.11.0

- Simplify token regex

## 0.10.0

- Add Python support

## 0.9.0

- Support "string" and "comment" scope types

## 0.8.0

- Support "fold", "unfold", and "swap" actions

## 0.7.0

- Support "cut" action (default term in vscode-talon is "carve")

## 0.6.0

- Support "copy" action

## 0.5.0

- Support "that" to refer to previous target
- Support "extract" action to extract to constant

## 0.4.0

- Support pair key and value nodes
- Support selecting all siblings

## 0.3.0

- Support wrap

## 0.2.0

- Add support for arguments and pairs
