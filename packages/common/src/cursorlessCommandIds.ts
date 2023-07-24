export const CURSORLESS_COMMAND_ID =
  "cursorless.command" satisfies CursorlessCommandId;

export interface CommandDescription {
  readonly isVisible: boolean;
  readonly title: string;
}

abstract class Command {
  constructor(private baseTitle: string) {}

  get title(): string {
    return `Cursorless: ${this.baseTitle}`;
  }
}

class HiddenCommand extends Command implements CommandDescription {
  readonly isVisible = false as const;
}

class VisibleCommand extends Command implements CommandDescription {
  readonly isVisible = true as const;
}

export const cursorlessCommandIds = [
  "cursorless.command",
  "cursorless.internal.updateCheatsheetDefaults",
  "cursorless.keyboard.escape",
  "cursorless.keyboard.modal.modeOff",
  "cursorless.keyboard.modal.modeOn",
  "cursorless.keyboard.modal.modeToggle",
  "cursorless.keyboard.targeted.clearTarget",
  "cursorless.keyboard.targeted.runActionOnTarget",
  "cursorless.keyboard.targeted.targetHat",
  "cursorless.keyboard.targeted.targetScope",
  "cursorless.keyboard.targeted.targetSelection",
  "cursorless.pauseRecording",
  "cursorless.recomputeDecorationStyles",
  "cursorless.recordTestCase",
  "cursorless.resumeRecording",
  "cursorless.showCheatsheet",
  "cursorless.showDocumentation",
  "cursorless.showQuickPick",
  "cursorless.takeSnapshot",
  "cursorless.toggleDecorations",
  "cursorless.showScopeVisualizer",
  "cursorless.hideScopeVisualizer",
] as const satisfies readonly `cursorless.${string}`[];

export type CursorlessCommandId = (typeof cursorlessCommandIds)[number];

export const cursorlessCommandDescriptions: Record<
  CursorlessCommandId,
  CommandDescription
> = {
  ["cursorless.toggleDecorations"]: new VisibleCommand("Toggle decorations"),
  ["cursorless.recomputeDecorationStyles"]: new VisibleCommand(
    "Recompute decoration styles",
  ),
  ["cursorless.recordTestCase"]: new VisibleCommand("Record test case"),
  ["cursorless.pauseRecording"]: new VisibleCommand(
    "Pause test case recording",
  ),
  ["cursorless.resumeRecording"]: new VisibleCommand(
    "Resume test case recording",
  ),
  ["cursorless.showDocumentation"]: new VisibleCommand("Show documentation"),

  ["cursorless.command"]: new HiddenCommand("The core cursorless command"),
  ["cursorless.showQuickPick"]: new HiddenCommand(
    "Pop up a quick pick of all cursorless commands",
  ),
  ["cursorless.showCheatsheet"]: new HiddenCommand(
    "Display the cursorless cheatsheet",
  ),
  ["cursorless.internal.updateCheatsheetDefaults"]: new HiddenCommand(
    "Update the default values of the cheatsheet payload used on the website and for local development. Be sure to run this on stock knausj and cursorless.",
  ),
  ["cursorless.takeSnapshot"]: new HiddenCommand(
    "Take a snapshot of the current editor state",
  ),
  ["cursorless.keyboard.escape"]: new HiddenCommand(
    "Should be mapped to the escape key when using cursorless keyboard. By default, exits modal keyboard mode, but changes behaviour when Cursorless is expecting a continuation keystroke.  For example, when you type a color and Cursorless is waiting for a character, it cancels the color and switches back to modal mode.",
  ),
  ["cursorless.keyboard.targeted.targetHat"]: new HiddenCommand(
    "Sets the keyboard target to the given hat",
  ),
  ["cursorless.keyboard.targeted.targetScope"]: new HiddenCommand(
    "Sets the keyboard target to the scope containing the current target",
  ),
  ["cursorless.keyboard.targeted.targetSelection"]: new HiddenCommand(
    "Sets the keyboard target to the current selection",
  ),
  ["cursorless.keyboard.targeted.clearTarget"]: new HiddenCommand(
    "Clears the current keyboard target",
  ),
  ["cursorless.keyboard.targeted.runActionOnTarget"]: new HiddenCommand(
    "Run the given action on the current keyboard target",
  ),
  ["cursorless.keyboard.modal.modeOn"]: new HiddenCommand(
    "Turn on the cursorless modal mode",
  ),
  ["cursorless.keyboard.modal.modeOff"]: new HiddenCommand(
    "Turn off the cursorless modal mode",
  ),
  ["cursorless.keyboard.modal.modeToggle"]: new HiddenCommand(
    "Toggle the cursorless modal mode",
  ),
  ["cursorless.showScopeVisualizer"]: new HiddenCommand(
    "Show the scope visualizer",
  ),
  ["cursorless.hideScopeVisualizer"]: new HiddenCommand(
    "Hide the scope visualizer",
  ),
};
