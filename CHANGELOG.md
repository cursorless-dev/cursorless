# Change Log

All notable changes to the "cursorless" extension will be documented in this file.

## 0.20.0 (24 July 2021)
### Enhancements

- Add "find all" action [\#100](https://github.com/pokey/cursorless-vscode/issues/100)
- Add "breakpoint" action [\#96](https://github.com/pokey/cursorless-vscode/issues/96)
- Add "indent" and "dedent" actions [\#94](https://github.com/pokey/cursorless-vscode/issues/94)
- Add "comment" action [\#93](https://github.com/pokey/cursorless-vscode/issues/93)
- Properly support "puff", "drop", and "float" [\#68](https://github.com/pokey/cursorless-vscode/issues/68)
- Support "paste" action [\#36](https://github.com/pokey/cursorless-vscode/issues/36)
- Support last \<n\> / first \<n\> subwords / characters [\#35](https://github.com/pokey/cursorless-vscode/issues/35)
- Support "until" [\#5](https://github.com/pokey/cursorless-vscode/issues/5)

### Bugs fixed

- Fix bug with two adjacent tokens [\#12](https://github.com/pokey/cursorless-vscode/issues/12)
- Fix "past end of line" [\#4](https://github.com/pokey/cursorless-vscode/issues/4)


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
