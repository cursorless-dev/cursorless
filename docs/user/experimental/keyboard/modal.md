# Modal keyboard interface

Cursorless has an experimental modal keyboard interface. This allows you to switch to Cursorless mode, and then you can use your keyboard to control Cursorless without holding any modifier keys, similar to how `vim` works.

The cursorless keyboard interface works by moving a highlight around, and allowing you to perform actions on the highlighted target.

![Delete demo](images/keyboardDelete.gif)
![Bring demo](images/keyboardBring.gif)
![Pour demo](images/keyboardPour.gif)

## Set up / config

### `keybindings.json`

Paste the following into your [VSCode `keybindings.json`](https://code.visualstudio.com/docs/getstarted/keybindings#_advanced-customization):

```json
    {
        "key": "ctrl+c",
        "command": "cursorless.keyboard.modal.modeOn",
        "when": "editorTextFocus"
    },
    {
        "key": "ctrl+c",
        "command": "cursorless.keyboard.targeted.targetSelection",
        "when": "cursorless.keyboard.modal.mode && editorTextFocus"
    },
    {
        "key": "escape",
        "command": "cursorless.keyboard.escape",
        "when": "cursorless.keyboard.listening && editorTextFocus && !suggestWidgetMultipleSuggestions && !suggestWidgetVisible"
    },
    {
        "key": "backspace",
        "command": "cursorless.keyboard.targeted.runActionOnTarget",
        "args": "remove",
        "when": "cursorless.keyboard.modal.mode && editorTextFocus"
    }
```

Any keybindings that use modifier keys should go in `keybindings.json` as well, with a `"when": "cursorless.keyboard.modal.mode` clause.

The above allows you to press `ctrl-c` to switch to Cursorless mode, `escape` to exit Cursorless mode, and `backspace` to issue the delete action while in Cursorless mode.

If you're alread in Cursorless mode, pressing `ctrl-c` again will target the current selection, which is useful if you move the cursor using your mouse while in Cursorless mode.

### `settings.json`

To bind keys that do not have modifiers (eg just pressing `a`), add entries like the following to your [VSCode `settings.json`](https://code.visualstudio.com/docs/getstarted/settings#_settingsjson) (or edit these settings in the VSCode settings gui by saying `"cursorless settings"`):

```json
  "cursorless.experimental.keyboard.modal.keybindings.scope": {
    "i": "line",
    "p": "paragraph",
    ";": "statement",
    ",": "collectionItem",
    ".": "functionCall",
    "'": "string",
    "sf": "namedFunction",
    "sc": "class",
    "st": "token",
    "sy": "type",
    "sv": "value",
    "sk": "collectionKey",
    "sp": "nonWhitespaceSequence",
    "ss": "boundedNonWhitespaceSequence",
    "sa": "argumentOrParameter",
    "sl": "url",
  },
  "cursorless.experimental.keyboard.modal.keybindings.action": {
    "t": "setSelection",
    "h": "setSelectionBefore",
    "l": "setSelectionAfter",
    "O": "editNewLineBefore",
    "o": "editNewLineAfter",
    "k": "insertCopyBefore",
    "j": "insertCopyAfter",
    "u": "replaceWithTarget",
    "m": "moveToTarget",
    "c": "clearAndSetSelection",
    "as": "swapTargets",
    "af": "foldRegion",
    "ak": "insertEmptyLineBefore",
    "aj": "insertEmptyLineAfter",
    "ai": "insertEmptyLinesAround",
    "ac": "copyToClipboard",
    "ax": "cutToClipboard",
    "ap": "pasteFromClipboard",
    "ad": "followLink"
  },
  "cursorless.experimental.keyboard.modal.keybindings.color": {
    "d": "default",
    "b": "blue",
    "g": "yellow",
    "r": "red"
  },
  "cursorless.experimental.keyboard.modal.keybindings.shape": {
    "x": "ex",
    "f": "fox",
    "q": "frame",
    "v": "curve",
    "e": "eye",
    "y": "play",
    "z": "bolt",
    "w": "crosshairs"
  },
  "cursorless.experimental.keyboard.modal.keybindings.vscodeCommand": {
    // For simple commands, just use the command name
    // "aa": "workbench.action.editor.changeLanguageMode",

    // For commands with args, use the following format
    // "am": {
    //   "commandId": "some.command.id",
    //   "args": ["foo", 0]
    // }

    // If you'd like to run the command on the active target, use the following format
    "am": {
      "commandId": "editor.action.joinLines",
      "executeAtTarget": true,
      // "keepChangedSelection": true,
      // "exitCursorlessMode": true,
    }
  }
```

Any supported scopes, actions, or colors can be added to these sections, using the same identifiers that appear in the second column of your customisation csvs. Feel free to add / tweak / remove the keyboard shortcuts above as you see fit.

The above allows you to press `d` followed by any letter to highlight the given token, `i` to expand to its containing line, and `t` to select the given target.

Note that key sequences are supported, eg mapping the sequence `af` to the fold action.
