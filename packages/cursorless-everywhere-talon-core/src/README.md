# Cursorless everywhere Talon

## Activate by enabling tag

Add a file like the following anywhere in your Talon user files. In the below example we are enabling Cursorless everywhere if we are not in vscode. Of course update this to fit your Cursorless IDE (vscode, neovim) of choice. Or globally enabled if this is your only Cursorless implementation.

```talon
not app: vscode
-

tag(): user.cursorless_everywhere_talon
```
