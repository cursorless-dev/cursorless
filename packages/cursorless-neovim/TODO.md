# features

- integrate tests for cursorless-neovim?
- use same yaml files?
- local tests before integrating to CI?
- see testCaseRecorder.vscode.test.ts

- "paste to row one" command require the text editor edit() function to be implemented
- prePhrase support in command server?
- only one comment to build, run neovim, and attach to it? (see my build program, run program, debug program)

# cleanup

- fix neovim terminology
  - extension => plugin
  - editor => window (any place remaining?)

# bugs

- we lose the initial selection if we were in visual mode before issuing a `copy` command. it does go back to the right line though.

- `take file` doesn't work, and just moves the cursor to the beginning of the file
- need to be in normal mode to execute the `take` command, as otherwise: Exception: Timed out waiting for response

# merge

- separate PR for setSelections() right now?

# discussion

- have the command server allow executing any lua function?
