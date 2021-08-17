# Change Log

All notable changes to the "cursorless" extension will be documented in this file.

## [0.21.0](https://github.com/pokey/cursorless-vscode/tree/0.21.0) (2021-08-17)

[Full Changelog](https://github.com/pokey/cursorless-vscode/compare/0.20.0...0.21.0)

**Implemented enhancements:**

- Improve error messages for sub token modifiers [\#201](https://github.com/pokey/cursorless-vscode/issues/201)
- Rename `xmlAttribute` scope type to `attribute` [\#198](https://github.com/pokey/cursorless-vscode/issues/198)
- Change highlight for insert new empty line [\#139](https://github.com/pokey/cursorless-vscode/issues/139)
- Add "source" mark [\#107](https://github.com/pokey/cursorless-vscode/issues/107)
- Add "reversed" modifier [\#99](https://github.com/pokey/cursorless-vscode/issues/99)
- Add "reverse" action [\#98](https://github.com/pokey/cursorless-vscode/issues/98)
- Add "sort" action [\#97](https://github.com/pokey/cursorless-vscode/issues/97)
- Scope modifier for regex [\#89](https://github.com/pokey/cursorless-vscode/issues/89)
- Support `"map"` and `"item"` modifiers for pattern destructuring [\#85](https://github.com/pokey/cursorless-vscode/issues/85)
- Support "reformat as" action [\#74](https://github.com/pokey/cursorless-vscode/issues/74)
- Support head and tail modifiers [\#70](https://github.com/pokey/cursorless-vscode/issues/70)
- Support duplication of lines [\#55](https://github.com/pokey/cursorless-vscode/issues/55)
- Support numeric ranges for insert [\#48](https://github.com/pokey/cursorless-vscode/issues/48)
- Support absolute line number mark [\#44](https://github.com/pokey/cursorless-vscode/issues/44)
- Standardize and align on terms for map entries and list elements [\#40](https://github.com/pokey/cursorless-vscode/issues/40)
- Support "call" action [\#38](https://github.com/pokey/cursorless-vscode/issues/38)
- Add "phones" action [\#31](https://github.com/pokey/cursorless-vscode/issues/31)
- Support "replace with" action [\#15](https://github.com/pokey/cursorless-vscode/issues/15)
- Support subword for token containing cursor [\#10](https://github.com/pokey/cursorless-vscode/issues/10)
- Infer type of first swap argument [\#8](https://github.com/pokey/cursorless-vscode/issues/8)

**Fixed bugs:**

- "Value" scope type in Python doesn't work when value contains array index [\#223](https://github.com/pokey/cursorless-vscode/issues/223)
- "Take past end of token" doesn't work [\#222](https://github.com/pokey/cursorless-vscode/issues/222)
- "token" modifier doesn't work with ranges [\#221](https://github.com/pokey/cursorless-vscode/issues/221)
- "take every key" and "take every value" are broken [\#220](https://github.com/pokey/cursorless-vscode/issues/220)
- "Chuck past end of T" removes trailing delimiter  [\#209](https://github.com/pokey/cursorless-vscode/issues/209)
- Containing token inference doesn't work next to single-character token [\#200](https://github.com/pokey/cursorless-vscode/issues/200)
- "float" highlights wrong line when applied to last line of file [\#197](https://github.com/pokey/cursorless-vscode/issues/197)
- Breakpoint action not working on mac [\#195](https://github.com/pokey/cursorless-vscode/issues/195)
- "take block" ends up with reversed selection [\#155](https://github.com/pokey/cursorless-vscode/issues/155)
- "dupe block" should add an extra newline before the new block [\#154](https://github.com/pokey/cursorless-vscode/issues/154)
- "Pour block" creates new line after the wrong line [\#153](https://github.com/pokey/cursorless-vscode/issues/153)
- Space delimiter code is too aggressive [\#152](https://github.com/pokey/cursorless-vscode/issues/152)
- `"arg"` modifier doesn't work in javascript [\#109](https://github.com/pokey/cursorless-vscode/issues/109)
- Support Javascript template literals for string scope [\#86](https://github.com/pokey/cursorless-vscode/issues/86)
- Fix function transformation in Typescript with "export default"  [\#20](https://github.com/pokey/cursorless-vscode/issues/20)
- Merge sequential pending change highlights [\#2](https://github.com/pokey/cursorless-vscode/issues/2)

**Closed issues:**

- Switch to flow-style for simple objects in test yaml dump [\#161](https://github.com/pokey/cursorless-vscode/issues/161)
- Implement scope modifier for argument name [\#144](https://github.com/pokey/cursorless-vscode/issues/144)
- Add documentation for how to  add a new language [\#132](https://github.com/pokey/cursorless-vscode/issues/132)
- Change "copy", "paste" and "cut" actions by moving selection and using built-ins [\#127](https://github.com/pokey/cursorless-vscode/issues/127)
- Error: Cannot read property 'rootNode' of undefined [\#113](https://github.com/pokey/cursorless-vscode/issues/113)
- Make test case recorder [\#59](https://github.com/pokey/cursorless-vscode/issues/59)
- "token" selection type should expand to nearest containing token [\#37](https://github.com/pokey/cursorless-vscode/issues/37)
- Change “if” to “if state” [\#50](https://github.com/pokey/cursorless-talon/issues/50)
- Try “pre” instead of “pree” [\#22](https://github.com/pokey/cursorless-talon/issues/22)

**Merged pull requests:**

- Fixed bug with array in pair value [\#241](https://github.com/pokey/cursorless-vscode/pull/241) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Fix cross-split selections [\#233](https://github.com/pokey/cursorless-vscode/pull/233) ([pokey](https://github.com/pokey))
- Bugfixes: past token, past end of, subtoken out of range, sort tokens [\#229](https://github.com/pokey/cursorless-vscode/pull/229) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Check ancestors for every [\#227](https://github.com/pokey/cursorless-vscode/pull/227) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Add newlines to end of yaml test cases [\#226](https://github.com/pokey/cursorless-vscode/pull/226) ([pokey](https://github.com/pokey))
- Added matching backtick quotes [\#211](https://github.com/pokey/cursorless-vscode/pull/211) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Let parse tree errors through [\#207](https://github.com/pokey/cursorless-vscode/pull/207) ([pokey](https://github.com/pokey))
- Updated how line decorations are shown [\#194](https://github.com/pokey/cursorless-vscode/pull/194) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Add docs for adding a new language [\#187](https://github.com/pokey/cursorless-vscode/pull/187) ([pokey](https://github.com/pokey))
- Add support for C++ [\#186](https://github.com/pokey/cursorless-vscode/pull/186) ([dgrunwald](https://github.com/dgrunwald))
- Treat line numbers as proper marks [\#180](https://github.com/pokey/cursorless-vscode/pull/180) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- docs cleanup [\#179](https://github.com/pokey/cursorless-vscode/pull/179) ([pokey](https://github.com/pokey))
- Added tests for head, tail and line numbers [\#178](https://github.com/pokey/cursorless-vscode/pull/178) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added documentation for test recorder [\#177](https://github.com/pokey/cursorless-vscode/pull/177) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Test on PR and push to master [\#172](https://github.com/pokey/cursorless-vscode/pull/172) ([brxck](https://github.com/brxck))
- Converted test recorder for bulk recordings [\#169](https://github.com/pokey/cursorless-vscode/pull/169) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Add surrounding pair modifier \(\#3\) [\#168](https://github.com/pokey/cursorless-vscode/pull/168) ([maciejklimek](https://github.com/maciejklimek))
- Declarative language definition [\#151](https://github.com/pokey/cursorless-vscode/pull/151) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Don't do inference from end to start [\#143](https://github.com/pokey/cursorless-vscode/pull/143) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added action replace [\#135](https://github.com/pokey/cursorless-vscode/pull/135) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Test Case Recorder [\#87](https://github.com/pokey/cursorless-vscode/pull/87) ([brxck](https://github.com/brxck))
- Fix cheat sheet [\#60](https://github.com/pokey/cursorless-talon/pull/60) ([pokey](https://github.com/pokey))
- Attempt to optimize dfa [\#57](https://github.com/pokey/cursorless-talon/pull/57) ([pokey](https://github.com/pokey))
- Add surrouding\_pair modifier [\#55](https://github.com/pokey/cursorless-talon/pull/55) ([maciejklimek](https://github.com/maciejklimek))
- Add action inspect; rename several actions [\#54](https://github.com/pokey/cursorless-talon/pull/54) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Cheat sheet bug: Updated with new list name [\#53](https://github.com/pokey/cursorless-talon/pull/53) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Switch subtoken to ordinals\_small [\#52](https://github.com/pokey/cursorless-talon/pull/52) ([pokey](https://github.com/pokey))
- Updated cheat sheet with new actions and modifiers [\#49](https://github.com/pokey/cursorless-talon/pull/49) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Updates to actions and modifiers [\#48](https://github.com/pokey/cursorless-talon/pull/48) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added spoken form to API [\#46](https://github.com/pokey/cursorless-talon/pull/46) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added modifiers row up down [\#44](https://github.com/pokey/cursorless-talon/pull/44) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added action call [\#43](https://github.com/pokey/cursorless-talon/pull/43) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added source mark [\#42](https://github.com/pokey/cursorless-talon/pull/42) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added actions sort and reverse [\#41](https://github.com/pokey/cursorless-talon/pull/41) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added modifiers head and tail [\#39](https://github.com/pokey/cursorless-talon/pull/39) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Updated scope modifiers [\#37](https://github.com/pokey/cursorless-talon/pull/37) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Expand sub piece to token [\#36](https://github.com/pokey/cursorless-talon/pull/36) ([AndreasArvidsson](https://github.com/AndreasArvidsson))
- Added actions: replace, phones, formatter, find [\#33](https://github.com/pokey/cursorless-talon/pull/33) ([AndreasArvidsson](https://github.com/AndreasArvidsson))

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
