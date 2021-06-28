# Cursorless

Allows cursorless editing and rapid navigation by decorating a single letter
from each token.

## Features

![swap](images/swap.gif)
![main-demo](images/main-demo.gif)
![demo-2](images/demo-2.gif)
![demo-3](images/demo-3.gif)

Many other marks / transformations / actions exist; documentation to follow.

## Installation

Currently depends on [Talon](https://talonvoice.com/), though a keyboard
version is planned.

See [cursorless-talon](https://github.com/pokey/cursorless-talon) for installation instructions.

## Extension Settings

This extension contributes the following settings:

* `cursorless.showOnStart`: whether decorations should appear on workspace start

## Known Issues

## Release Notes

### 0.14.0
- Support `insertLineBefore` and `insertLineAfter` actions ("drink" and "pour")

### 0.13.0
- Support "file" selection type to refer to the entire file
- Improve error messages

### 0.12.0
- Add subword support
- [python] Fix parameter transformation
- Show exceptions to user
- Properly support using "token" to select only token, eg "take funk gust and
  token fine" to prevent "fine" from being inferred to have the `function`
  transformation.
- Support "bring" action to use another target from elsewhere in the document

### 0.11.0
- Simplify token regex

### 0.10.0
- Add Python support

### 0.9.0
- Support "string" and "comment" scope types

### 0.8.0
- Support "fold", "unfold", and "swap" actions

### 0.7.0
- Support "cut" action (default term in vscode-talon is "carve")

### 0.6.0
- Support "copy" action

### 0.5.0
- Support "that" to refer to previous target
- Support "extract" action to extract to constant

### 0.4.0
- Support pair key and value nodes
- Support selecting all siblings

### 0.3.0
- Support wrap

### 0.2.0
- Add support for arguments and pairs