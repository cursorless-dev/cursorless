# questions for Pokey

- get rid of the neovim client singleton
- should the neovim IDE, neovim text editor and neovim text document, etc be in neovim-common? see NeovimIDE being used in recorded.neovim.test.ts
- what about the eventEmitter? see NeovimEvents.ts
- what about handleCommandInternal? see runCommand.ts

- open PR:
  - async getFocusedElementType (Cursorless and command server)
  - test-harness vscode specifics
  - some missing await

# mocha tests

- pass the neovim client via dependency injection (do not import it between projects, since each extension has its own)(but for now it's fine to have the singleton)
  - We directly import vscode in various places in cursorless vscode. We’re trying to stop, but not the end of the world if it merges that way
  - the neovim e2e extension can have its own client
  - we can pass the neovim client to mocha tests using a global. there’s a way to give mocha an object that tests can access https://mochajs.org/api/mocha#run not ideal, but maybe try a global variable for now https://github.com/mochajs/mocha/issues/3780#issuecomment-583064196 take the neovim client you get when the test-harness is activated, set it on the global variable, and then get it from within the recorded.neovim.test. I just have the feeling that if things in the test runner extension need neovim client that comes in during extension activation, they should use the one that they get when the test runner extension is activated. there’s probably better ways to do it, but for now I think that’s better than different extensions relying on each others’ neovim clients.
- thinking on it, in theory we could use `global` for the other stuff in test-harness. not the prettiest thing, but it does pretty accurately capture what’s going on here. worth seeing whether there’s one single global object that any code within the same node process can access / modify
- create the new neovim registry package
- the neovim registry package would basically be 2 dictionaries, one to hold commands and another one to hold apis
- mocha environment shouldn’t be calling functions from cursorless-neovim. I have crossed that boundary lol
  - basically mocha tests need to talk to cursorless-neovim, and they need to talk to neovim
  - for the former (talking to cursorless-neovim) they should do so via the neovim-registry package we discussed
  - for talking to neovim, they should do it via the neovim client that gets passed in when the e2e extension activates
  - `openNewEditor` should go into some kind of `neovim-common` or something so both can access it. that’s how it works for vscode. we have `@cursorless/vscode`, `vscode-common`, and `@cursorless/vscode-e2e`. `@cursorless/vscode` and `@cursorless/vscode-e2e` both import from `vscode-common`
  - oh is `openNewEditor` only needed by the test harness? in that case i’d still make the client be an arg to `openNewEditor`, but it can just exist in `@cursorless/neovim-e2e`
  - tbh ideally `test-harness` shouldn’t have access to `ide` at all. fwiw in vscode we just pass pointers to the functions we need through cursorlessApi rather than passing the whole ide. otherwise you end up needing the test harness to import cursorless-neovim in order to get the types it wants. notice how the type signature of the helpers lives in a the `vscode-common` shared dependency https://github.com/cursorless-dev/cursorless/blob/main/packages/vscode-common/src/TestHelpers.ts
- So I need to add 3 packages: `cursorless-neovim-e2e` (for `recorded.neovim.test.ts`) and `neovim-common` (with helpers to talk to neovim through neovimClient) and `neovim-registry` (to register stuff and access them from anywhere) and `test-harness` (for the mocha machinery)
  - fwiw in neovim-common, I think it should only ever get the client passed in as an arg and not store it. neovim-common should be stateless, ie no globals / singletons, that way we don’t care how / where it gets bundled up
  - tbh as much of our code as possible should be stateless ie no globals / singletons
- but before we get too far it’s worth verifying that you can get the `neovim client` from the mocha `test-harness` to the test case itself

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

- how do you paste in terminal mode?
- vim plugins in my init.lua?
