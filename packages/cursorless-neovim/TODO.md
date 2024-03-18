# features

- integrate tests for cursorless-neovim?
  - use same yaml files?
  - local tests before integrating to CI?
  * see testCaseRecorder.vscode.test.ts

* prePhrase support in command server?

# cleanup

- fix neovim terminology
  - extension => plugin
  - editor => window (any place remaining?)

# bugs

- `take file` doesn't work, and just moves the cursor to the beginning of the file
- need to be in normal mode to execute the `take` command, as otherwise: Exception: Timed out waiting for response

# merge

- separate PR for setSelections() right now?

# discussion

- have the command server allow executing any lua function?
