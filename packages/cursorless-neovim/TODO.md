# questions

- unit tests for lineCount similar to C:\work\tools\voicecoding\cursorless_fork\packages\common\src\types\range.test.ts or selection.test.ts
- logs in vscode would be better
- test-harness outside of cursorless-neovim
- see cursorless_original\packages\test-harness\dist
- functions are called in parallel. Is that okay?
  vim.api.nvim_call_function('CursorlessLoadExtension', {})
  vim.api.nvim_call_function('CommandServerLoadExtension', {})

- test-harness\dist\cursorless-vscode-e2e\src\suite\editNewCell.vscode.test.cjs
  var EXTENSION_ID = "pokey.cursorless";
  var getCursorlessApi = () => getExtensionApiStrict(EXTENSION_ID);
  var getParseTreeApi = () => getExtensionApiStrict("pokey.parse-tree");
  // lazy import of cursorless-engine from test-harness

- unit tests for testing the lua functions for ranges, selections etc.
- utf8 is not supported well - probably neovim pb (translate to utf8) - no utf8 thing in cursorless (strings that under the hood are utf16) - need to decode it before giving it to cursorless
- Pokey: pure dependency injection: rearchitecture code to reduce use of singletons, have neovimIDE available where I want (no need to detect spyIDE vs normalizedIDE, etc.), no need to export ide() singleton from cursorless to remove all the DEP-INJ:
- Pokey: go over the remaining "TODO:" in the code
- Pokey: understand better the rangeUpdater object (e.g. "paste to first paint row one")
- "paste to row one" from the clipboard, see getFromClipboard()

# to do

- chuck first paint row two and third paint row two
- scout text command in any mode
- find a way to load nvim.exe in the background as part of launch.json/tasks.json to load neovim so we can attach to it with debugger
- hack and redirect console.log/console.info to console.warning in cursorless repo so we don't have to change all the instances? And restore all console.warn to be console.log
- understand why no node plugin logging in vscode anymore with latest node-client?

# Pokey todo list

- separate PRs to be accepted: textEditor.setSelections(), fixtures-data
- exception in CustomSpokenForms.updateSpokenFormMaps: https://github.com/cursorless-dev/cursorless/issues/2261 (pokey will fix it)

# to do later

- can we reload the extensions after a modification without reloading neovim? does not seem to work atm
- have the command server allow executing any lua function? probably not because we already have neovim rpc.
- prePhrase support in command server? https://www.cursorless.org/docs/contributing/architecture/hat-snapshots/ only useful to chain multiple commands to avoid hats being changed in the middle so not useful for now
- merge talon-vscode-command-client into community once we know for sure we use the command-server (and not neovim python rpc)
- merge cursorless-talon into the Cursorless repo

# fidgeting

- vim plugins in my init.lua?
- fix neovim terminology
  - extension => plugin
  - editor => window (any place remaining?)
    have readme with the corresponding terms between vscode and neovim
