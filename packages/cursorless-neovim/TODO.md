# features

- integrate tests for cursorless-neovim?
  - use same yaml files?
  - local tests before integrating to CI?
  * see testCaseRecorder.vscode.test.ts

* prePhrase support in command server

# cleanup

- fix neovim terminology
  - extension => plugin
  - editor => window (any place remaining?)

# bugs

- `take file` doesn't work, and just moves the cursor to the beginning of the file
- I can't chain two cursorless commands without waiting a little bit, command client: Exception: Timed out waiting for response

# merge

- separate PR for setSelections() right now?

# discussion

- have the command server allow executing any lua function?
