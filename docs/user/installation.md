# Installation

1. Install [Talon](https://talonvoice.com/)
2. Install [knausj_talon](https://github.com/knausj85/knausj_talon).
   _(Or see [here](https://github.com/cursorless-dev/cursorless/wiki/Talon-home-requirements) if you prefer not to use knausj.)_
3. Install [VSCode](https://code.visualstudio.com/)
4. Install the [VSCode talon extension pack](https://marketplace.visualstudio.com/items?itemName=pokey.talon)
5. Install the [Cursorless VSCode extension](https://marketplace.visualstudio.com/items?itemName=pokey.cursorless)
6. Follow the instructions below to install the Talon side of Cursorless.
7. Finally, restart Talon.

## Installing the Talon side

### Linux & Mac

Clone repo into `~/.talon/user`

```insert code:
cd ~/.talon/user
git clone https://github.com/cursorless-dev/cursorless-talon.git cursorless-talon
```

Alternatively, access the directory by right clicking the Talon icon in taskbar, clicking Scripting>Open ~/talon, and navigating to user.

The folder structure should look something like the below:

```insert code:
~/.talon/user/knausj_talon
~/.talon/user/knausj_talon/apps
~/.talon/user/knausj_talon/code
...
~/.talon/user/cursorless-talon
~/.talon/user/cursorless-talon/src
...
```

### Windows

Clone repo into `%AppData%\Talon\user`

```insert code:
cd %AppData%\Talon\user
git clone https://github.com/cursorless-dev/cursorless-talon.git cursorless-talon
```

Alternatively, access the directory by right clicking the Talon icon in taskbar, clicking Scripting>Open ~/talon, and navigating to user.

The folder structure should look something like the below:

```insert code:
%AppData%\Talon\user\knausj_talon
%AppData%\Talon\user\knausj_talon\apps
%AppData%\Talon\user\knausj_talon\code
...
%AppData%\Talon\user\cursorless-talon
%AppData%\Talon\user\cursorless-talon\src
...
```
