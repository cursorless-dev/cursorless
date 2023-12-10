# cursorless talon

- Creates arg of spoken forms
  - Key!
- Invokes the cheatsheet command in the vscode extension passing the spoken forms (aka all the commands, scopes and actions available)

# cursorless vscode extension

- Takes the pre-built cheatsheet.html and injects the spoken forms into it
- Opens the fixed-up cheatsheet.html in a new tab

# Typings?

- Source of truth [](packages/cheatsheet/src/lib/components/CheatsheetListComponent.tsx)
- Copied over (can we elliminate the copy?) [](packages/cursorless-engine/src/core/Cheatsheet.ts)

# Questions

- How to inject usage stats?
  - Separate variable for usage since its not enabled by default
- How to configure usage stats in cheatsheet?
- How will this interact with data collection flag?

# Notes

- updateCheatsheetDefaults might help with debugging with actual commands
