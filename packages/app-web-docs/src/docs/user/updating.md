# Updating

Cursorless consists of two components:

- A VSCode extension, and
- A set of Talon files to define the spoken commands

## Updating the VSCode extension

The VSCode extension will update automatically, unless for some reason you have auto-updating disabled, in which case you will have to [update the extension manually](https://code.visualstudio.com/docs/editor/extension-marketplace#_update-an-extension-manually).

## Updating the Talon side

The Talon side of Cursorless always needs to be updated manually by performing a `git pull` in the appropriate directory, and then restarting Talon.

### Linux & Mac

Assuming the default install location of `~/.talon/user/cursorless-talon`:

```bash
cd ~/.talon/user/cursorless-talon
git pull
```

Then restart Talon.

### Windows

Assuming the default install location of `%AppData%\Talon\user\cursorless-talon`:

```batch
cd %AppData%\Talon\user\cursorless-talon
git pull
```

Then restart Talon.
