# Installation

1. Install [Talon](https://talonvoice.com/)
2. Install [knausj_talon](https://github.com/knausj85/knausj_talon). Note that
   even a heavily modified version of knausj should be fine, but make sure you
   have merged since commit
   [knausj85/knausj_talon@`e373780`](https://github.com/knausj85/knausj_talon/commit/e373780af16256ab8fd5638af32d97fa23c4c0fc).
   If rebasing is too painful, or if you are not a user of knausj, you can just
   clone [the command
   client](https://github.com/pokey/talon-vscode-command-client) into your
   talon user directory. You will need [a couple other things](https://github.com/cursorless-dev/cursorless-vscode/wiki/Talon-home-requirements) from knausj but nothing major. Please file an issue if you have trouble getting this repo to work without knausj.
3. Install [VSCode](https://code.visualstudio.com/)
4. Install the [VSCode talon extension pack](https://marketplace.visualstudio.com/items?itemName=pokey.talon)
5. Install the [Cursorless VSCode extension](https://marketplace.visualstudio.com/items?itemName=pokey.cursorless)
6. Follow the instructions below to install the talon side of cursorless.

## Installing the talon side

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
