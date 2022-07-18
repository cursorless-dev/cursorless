# Updating

VSCode will update the Cursorless extension automatically. In the rare case that you have extension auto-updating disabled, you will have to [update the extension manually](https://code.visualstudio.com/docs/editor/extension-marketplace#_update-an-extension-manually).

## Updating the Talon side

The Talon side of Cursorless always needs to be updated manually, simply by performing a `git pull`.

### Linux & Mac

Assuming the default install location of `~/.talon/user`:

```insert code:
cd ~/.talon/user
git pull
```

### Windows

Assuming the default install location of `%AppData%\Talon\user`:

```insert code:
cd %AppData%\Talon\user
git pull
```
