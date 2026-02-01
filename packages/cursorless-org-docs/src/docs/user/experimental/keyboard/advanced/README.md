# Advanced Keyboard Interface (Experimental)

**⚠️ WARNING: This is a bleeding-edge experimental feature that is likely to break in future versions. Use at your own risk. ⚠️**

The Cursorless Advanced Keyboard Interface provides a fully customizable keyboard-based command system for controlling Cursorless. This document explains how to set up and use this experimental feature.

## Setup Instructions

To use the Advanced Keyboard Interface, you need to:

1. Copy the configuration into your VSCode settings.json
2. Configure your keybindings to enter and exit the keyboard mode

### Step 1: Copy the Configuration

Copy the configuration from this file into your VSCode settings.json:

```
packages/cursorless-vscode/src/keyboard/keyboard-config.fixture.json
```

The configuration should be merged directly into your settings.json file, not copied as a separate file.

### Step 2: Configure Keybindings

Add the following to your VSCode `keybindings.json`:

```json
{
    "key": "ctrl+c",
    "command": "cursorless.keyboard.modal.modeOn",
    "when": "editorTextFocus"
},
{
    "key": "escape",
    "command": "cursorless.keyboard.escape",
    "when": "cursorless.keyboard.listening && editorTextFocus && !suggestWidgetMultipleSuggestions && !suggestWidgetVisible"
}
```

## Understanding the Interface

The Advanced Keyboard Interface works through a grammar-based command system. Commands are composed of sequences of key presses that correspond to different terminals in the grammar.

### Command Grammar

The interface's grammar is defined in `packages/cursorless-vscode/src/keyboard/grammar/grammar.ne`. A visual representation of this grammar can be viewed at [Cursorless Keyboard Modal Railroad](https://www.cursorless.org/keyboard-modal-railroad).

### Configuration Sections

The configuration file is divided into several sections, each mapping keyboard sequences to different components of the grammar:

#### Scope Types

```json
"cursorless.experimental.keyboard.modal.keybindings.scope": {
  "i": "line",
  "sb": "paragraph",
  ";": "statement",
  // additional scopes...
}
```

#### Actions

```json
"cursorless.experimental.keyboard.modal.keybindings.action": {
  "at": "setSelection",
  "ah": "setSelectionBefore",
  // additional actions...
}
```

#### Colors

```json
"cursorless.experimental.keyboard.modal.keybindings.color": {
  "d": "default",
  "b": "blue",
  // additional colors...
}
```

#### Shapes

```json
"cursorless.experimental.keyboard.modal.keybindings.shape": {
  "hx": "ex",
  "hf": "fox",
  // additional shapes...
}
```

#### Miscellaneous

```json
"cursorless.experimental.keyboard.modal.keybindings.misc": {
  "fx": "combineColorAndShape",
  "fk": "makeRange",
  // additional misc commands...
}
```

#### Special Marks

```json
"cursorless.experimental.keyboard.modal.keybindings.specialMark": {
  "mc": "cursor"
}
```

#### Modifiers

```json
"cursorless.experimental.keyboard.modal.keybindings.modifier": {
  "n": "nextPrev",
  "*": "every",
  // additional modifiers...
}
```

#### VSCode Commands

```json
"cursorless.experimental.keyboard.modal.keybindings.vscodeCommand": {
  "va": "editor.action.addCommentLine",
  // additional VSCode commands...
}
```

#### Paired Delimiters

```json
"cursorless.experimental.keyboard.modal.keybindings.pairedDelimiter": {
  "wl": "angleBrackets",
  "wt": "backtickQuotes",
  // additional delimiters...
}
```

## Examples

Here are some example command sequences (spaces are added only for readability and should be ignored when typing the commands):

### `dx fa dy c`
- What it does: Delete two tokens marked with default color hats
- Voice command equivalent: "change plex and yank"
- Breakdown:
  - `dx`: targets token with default color hat over 'x'
  - `fa`: make a list/combine targets ("and")
  - `dy`: targets token with default color hat over 'y'
  - `c`: clear and set selection (exits Cursorless mode)

### `da *st c`
- What it does: Delete every token
- Voice command equivalent: "change every token air"
- Breakdown:
  - `da`: targets token with default color hat over 'a'
  - `*`: every (select all instances of the scope)
  - `st`: token scope
  - `c`: clear and set selection (exits Cursorless mode)

### `db 3st c`
- What it does: Delete three consecutive tokens starting with blue hat
- Voice command equivalent: "change three tokens bat"
- Breakdown:
  - `db`: targets token with default color hat over 'b'
  - `3`: three (select this number of instances)
  - `st`: token scope
  - `c`: clear and set selection (exits Cursorless mode)

### `dd -3st c`
- What it does: Delete three consecutive tokens going backwards from default hat
- Voice command equivalent: "change three tokens backwards drum"
- Breakdown:
  - `dd`: targets token with default color hat over 'd'
  - `-3`: three tokens backward
  - `st`: token scope
  - `c`: clear and set selection (exits Cursorless mode)

### `db wp c`
- What it does: Delete the parentheses and their contents
- Voice command equivalent: "change parens bat"
- Breakdown:
  - `db`: targets token with default color hat over 'b'
  - `wp`: parentheses pair
  - `c`: clear and set selection (exits Cursorless mode)

### `dw wj c`
- What it does: Delete any pair of matching delimiters and their contents
- Voice command equivalent: "change pair whale"
- Breakdown:
  - `dw`: targets token with default color hat over 'w'
  - `wj`: any pair (matches any surrounding pairs)
  - `c`: clear and set selection (exits Cursorless mode)

### `da mi c`
- What it does: Delete the content inside delimiters while preserving the delimiters
- Voice command equivalent: "change inside air"
- Breakdown:
  - `da`: targets token with default color hat over 'a'
  - `mi`: modifier to select inside the target
  - `c`: clear and set selection (exits Cursorless mode)

### `db mt wb mi c`
- What it does: Delete from the token to the end of the containing curly bracket block
- Voice command equivalent: "change inside tail curly bat"
- Breakdown:
  - `db`: targets token with default color hat over 'b'
  - `mt`: extend through end of (tail modifier)
  - `wb`: curly brackets
  - `mi`: modifier to select inside
  - `c`: clear and set selection (exits Cursorless mode)

### `da aw wp`
- What it does: Wrap the token in parentheses
- Voice command equivalent: "round wrap air"
- Breakdown:
  - `da`: targets token with default color hat over 'a'
  - `aw`: wrap action
  - `wp`: parentheses (round)

### `da fs dc st c`
- What it does: Delete tokens in a vertical slice from one token to another
- Voice command equivalent: "keyboard air; keyboard slice past cap; change token"
- Breakdown:
  - `da`: targets token with default color hat over 'a'
  - `fs`: make vertical range (slice)
  - `dc`: targets token with default color hat over 'c'
  - `st`: token scope
  - `c`: clear and set selection (exits Cursorless mode)

## Known Limitations

- The keyboard interface grammar and configuration may change significantly in future versions
- Not all Cursorless capabilities are accessible through the keyboard interface
- Error handling is minimal
- Documentation may not match implementation as this is rapidly evolving

## Customization

You can customize any of the keyboard mappings by modifying the configuration in your settings.json. The key sequences can be adjusted to match your preferences, but the command structure must follow the grammar defined in the railroad diagrams.
