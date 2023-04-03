export const CURSORLESS_COMMAND_ID =
  "cursorless.command" satisfies CursorlessCommandId;

export interface VisibleCommandDescription {
  readonly isVisible: true;
  readonly title: string;
}

interface HiddenCommandDescription {
  readonly isVisible: false;
}

export type CommandDescription =
  | VisibleCommandDescription
  | HiddenCommandDescription;

abstract class Command {}

class HiddenCommand extends Command implements HiddenCommandDescription {
  readonly isVisible = false as const;
}

class VisibleCommand extends Command implements VisibleCommandDescription {
  readonly isVisible = true as const;

  constructor(private baseTitle: string) {
    super();
  }

  get title(): string {
    return `Cursorless: ${this.baseTitle}`;
  }
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

  ["cursorless.command"]: new HiddenCommand(),
  ["cursorless.showQuickPick"]: new HiddenCommand(),
  ["cursorless.showCheatsheet"]: new HiddenCommand(),
  ["cursorless.internal.updateCheatsheetDefaults"]: new HiddenCommand(),
  ["cursorless.takeSnapshot"]: new HiddenCommand(),
  ["cursorless.keyboard.escape"]: new HiddenCommand(),
  ["cursorless.keyboard.targeted.targetHat"]: new HiddenCommand(),
  ["cursorless.keyboard.targeted.targetScope"]: new HiddenCommand(),
  ["cursorless.keyboard.targeted.targetSelection"]: new HiddenCommand(),
  ["cursorless.keyboard.targeted.clearTarget"]: new HiddenCommand(),
  ["cursorless.keyboard.targeted.runActionOnTarget"]: new HiddenCommand(),
  ["cursorless.keyboard.modal.modeOn"]: new HiddenCommand(),
  ["cursorless.keyboard.modal.modeOff"]: new HiddenCommand(),
  ["cursorless.keyboard.modal.modeToggle"]: new HiddenCommand(),
};
