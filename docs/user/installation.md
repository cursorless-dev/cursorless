# Installation

1. Install [Talon](https://talonvoice.com/)   
    * Make sure the speech engine is installed by clicking on the `Speech Recognition` tab
2. Install the [community Talon commands](https://github.com/talonhub/community).
   _(Or see [here](https://github.com/cursorless-dev/cursorless/wiki/Talon-home-requirements) if you prefer not to use community.)_
3. Install [VSCode](https://code.visualstudio.com/)
4. Install the [VSCode talon extension pack](https://marketplace.visualstudio.com/items?itemName=pokey.talon)
5. Install the [Cursorless VSCode extension](https://marketplace.visualstudio.com/items?itemName=pokey.cursorless)
6. Follow the instructions below to install the Talon side of Cursorless.
7. Restart Talon.

## Installing the Talon side

### Linux & Mac

Clone repo into `~/.talon/user`

```bash
cd ~/.talon/user
git clone https://github.com/cursorless-dev/cursorless-talon.git cursorless-talon
```

Alternatively, access the directory by right clicking the Talon icon in taskbar, clicking Scripting>Open ~/talon, and navigating to user.

The folder structure should look something like the below:

```
~/.talon/user/community
~/.talon/user/community/apps
~/.talon/user/community/code
...
~/.talon/user/cursorless-talon
~/.talon/user/cursorless-talon/src
...
```

Now, restart Talon.

### Windows

Clone repo into `%AppData%\Talon\user`

```bash
cd %AppData%\Talon\user
git clone https://github.com/cursorless-dev/cursorless-talon.git cursorless-talon
```

Alternatively, access the directory by right clicking the Talon icon in taskbar, clicking Scripting>Open ~/talon, and navigating to user.

The folder structure should look something like the below:

```
%AppData%\Talon\user\community
%AppData%\Talon\user\community\apps
%AppData%\Talon\user\community\code
...
%AppData%\Talon\user\cursorless-talon
%AppData%\Talon\user\cursorless-talon\src
...
```

Now, restart Talon.
