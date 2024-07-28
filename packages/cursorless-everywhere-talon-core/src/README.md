# Cursorless everywhere Talon

## Activate by enabling tag

In the below example we are enabling curse es everywhere Talon if we are not in vscode. Of course update this to fit your Cursorless IDE (vscode, neovim) of choice. Or globally enabled if this is your only Cursorless implementation.

```talon
not app: vscode
-

tag(): user.cursorless_everywhere_talon
```