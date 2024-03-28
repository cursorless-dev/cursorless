# questions

- Pokey: merge talon-vscode-command-client and cursorless-talon?
- Pokey: exception in CustomSpokenForms.updateSpokenFormMaps: https://github.com/cursorless-dev/cursorless/issues/2261 (pokey will fix it)
- Pokey: go over the "TODO:" in the code
- Pokey: pure dependency injection: rearchitecture code to reduce use of singletons, have neovimIDE available where I want (no need to detect spyIDE vs normalizedIDE, etc.), no need to export ide() singleton from cursorless
- NPM as package manager message (see screenshot)
- Pokey: understand better the rangeUpdater object (e.g. "paste to first paint row one")
- git repo to mention problems/issues? for instance the can't reenter normal mode from terminal mode? on the cursorless repo?

# to do

- "paste to row one" from the clipboard, see getFromClipboard()
- find a way to load nvim.exe in the background as part of launch.json/tasks.json to load neovim so we can attach to it with debugger
- hack and redirect console.log/console.info to console.warning in cursorless repo so we don't have to change all the instances? And restore all console.warn to be console.log
- understand why no node plugin logging in vscode anymore with latest node-client?
- utf8 is not supported well
- fix the bring command on the terminal because it doesn't work anymore

# to do later

- can we reload the extensions after a modification without reloading neovim? does not seem to work atm
- separate PR for text editor setSelections()
- separate PR to move fixtures to @cursorless/common
- have the command server allow executing any lua function? probably not because we already have neovim rpc.
- prePhrase support in command server? https://www.cursorless.org/docs/contributing/architecture/hat-snapshots/ only useful to chain multiple commands to avoid hats being changed in the middle so not useful for now

# fidgeting

- fix neovim terminology
  - extension => plugin
  - editor => window (any place remaining?)
    have readme with the corresponding terms between vscode and neovim
