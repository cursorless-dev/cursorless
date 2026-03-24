import type {
  Command,
  CommandResponse,
  IDE,
  NormalizedIDE,
  SelectionOffsets,
  TestHelpers,
} from "@cursorless/lib-common";
import type { StoredTargetMap } from "@cursorless/lib-engine";
import type { TalonJsIDE } from "../ide/TalonJsIDE";

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
  // oxlint-disable-next-line typescript/no-redundant-type-constituents
  runCommand(command: Command): Promise<CommandResponse | unknown>;
}

export interface ActivateReturnValue {
  testHelpers?: TalonJsTestHelpers;
}
