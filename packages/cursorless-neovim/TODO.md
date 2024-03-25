# questions

- merge talon-vscode-command-client and cursorless-talon?

# features

- insert to be paste() to have working bring into terminal
- "paste to row one" from the clipboard
- prePhrase support in command server? https://www.cursorless.org/docs/contributing/architecture/hat-snapshots/
- only one command to build, run neovim, and attach to it? (see my build program, run program, debug program)
  - find a way to load neovim from script so we know when it is loaded so we can then attach to it for debugging?
- avoid importing cursorless from command server?
- test if we can reload the extensions after a modification without reloading neovim
- removed deasync dependencies

# to do later

- separate PR for text editor setSelections()
- separate PR for the text editor edit()
- have the command server allow executing any lua function? probably not because we already have neovim rpc.

# fidgeting

- integrate tests for cursorless-neovim? see testCaseRecorder.vscode.test.ts
- fix neovim terminology
  - extension => plugin
  - editor => window (any place remaining?)
    have readme with the corresponding terms between vscode and neovim
- git repo to mention issues, for instance the can't reenter normal mode from terminal mode?
