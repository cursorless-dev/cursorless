# features

- bring command

* "paste to row one" command require the text editor edit() function to be implemented
* prePhrase support in command server?
* only one command to build, run neovim, and attach to it? (see my build program, run program, debug program)
* separate PR for text editor setSelections()
* have the command server allow executing any lua function? probably not because we already have neovim rpc.

# bugs

- we lose the initial selection if we were in visual mode before issuing a `copy` command. it does go back to the right line though.
- `take file` doesn't work, and just moves the cursor at the beginning of the file

# discussion

# fidgeting

- integrate tests for cursorless-neovim? see testCaseRecorder.vscode.test.ts
- fix neovim terminology
  - extension => plugin
  - editor => window (any place remaining?)
