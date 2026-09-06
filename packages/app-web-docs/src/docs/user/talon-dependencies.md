---
sidebar_group: Advanced
sidebar_group_position: 7
sidebar_position: 1
---

# Talon dependencies

Cursorless uses several definitions from [Talon Community](https://github.com/talonhub/community). If your Talon setup includes Talon Community and you have not removed any of the dependencies listed below, you can safely ignore this page.

If you use Cursorless without Talon Community—or maintain a custom fork—you must provide these definitions somewhere in your Talon user directory.

## Core dependencies

Cursorless will not work without the following:

- [VS Code command client](https://github.com/pokey/talon-vscode-command-client), which Talon Community includes in [`apps/vscode/vscode_command_client.py`](https://github.com/talonhub/community/blob/main/apps/vscode/vscode_command_client.py)
- [`user.any_alphanumeric_key` capture](https://github.com/talonhub/community/blob/607c3415f5f29a5f75db6fe5648e37f514f62ac5/core/keys/keys.py#L71-L74)
- [`vscode` app definition](https://github.com/talonhub/community/blob/d57d65ae65a4b2d542ccfe44bc369569d46479c5/apps/vscode/vscode.py#L8)

## Feature dependencies

The following definitions are required only for the corresponding commands or modifiers.

### Homophones: `"phones"`

- [`user.homophones_get(word: str) -> list[str]` action](https://github.com/talonhub/community/blob/c80cf0f9495b0b8b4594764e827e1355101ca2ba/code/homophones.py#L198-L203)

### Formatting: `"format camel"`

- [`user.formatters` capture](https://github.com/talonhub/community/blob/c80cf0f9495b0b8b4594764e827e1355101ca2ba/code/formatters.py#L177-L180)
- [`user.reformat_text(text: str, formatters: str) -> str` action](https://github.com/talonhub/community/blob/c80cf0f9495b0b8b4594764e827e1355101ca2ba/code/formatters.py#L272-L275)

### Counted scopes: `"two tokens"`

- [`number_small` capture](https://github.com/talonhub/community/blob/7e90a2ee91bc6e9e54b76bd5b4d4b9274372bdc3/core/numbers/numbers.py#L292-L294)

### Ordinal scopes: `"first token"`

- [`user.ordinals_small` capture](https://github.com/talonhub/community/blob/7e90a2ee91bc6e9e54b76bd5b4d4b9274372bdc3/core/numbers/ordinals.py#L69-L72)
