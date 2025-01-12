import type {
  Command,
  CommandResponse,
  IDE,
  NormalizedIDE,
  TestHelpers,
} from "@cursorless/common";
import type { StoredTargetMap } from "@cursorless/cursorless-engine";
import type { TalonJsIDE } from "../ide/TalonJsIDE";

export interface SelectionOffsets {
  // Document offsets
  anchor: number;
  active: number;
}

export interface CharacterRangeOffsets {
  type: "character";
  start: number;
  end: number;
}

export interface EditorState {
  text: string;
  languageId?: string;
  selections: SelectionOffsets[];
}

export interface EditorChange {
  readonly text: string;
  readonly rangeOffset: number;
  readonly rangeLength: number;
}

export interface EditorEdit {
  /**
   * The new document content after the edit. We provide this for platforms
   * where we can't easily handle {@link changes}.
   */
  text: string;
  changes: EditorChange[];
}

export interface TalonJsTestHelpers extends Omit<TestHelpers, "takeSnapshot"> {
  talonJsIDE: TalonJsIDE;
  ide: NormalizedIDE;
  storedTargets: StoredTargetMap;
  injectIde: (ide: IDE) => void;
  runCommand(command: Command): Promise<CommandResponse | unknown>;
}

export interface ActivateReturnValue {
  testHelpers?: TalonJsTestHelpers;
}
