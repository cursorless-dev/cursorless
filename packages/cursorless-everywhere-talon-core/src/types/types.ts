import type { IDE, NormalizedIDE, TestHelpers } from "@cursorless/common";
import type { StoredTargetMap } from "@cursorless/cursorless-engine";
import type { TalonJsIDE } from "../ide/TalonJsIDE";

export interface OffsetSelection {
  // Document offsets
  anchor: number;
  active: number;
}

export interface EditorState {
  text: string;
  languageId?: string;
  selections: OffsetSelection[];
}

export interface EditorChange {
  readonly text: string;
  readonly rangeOffset: number;
  readonly rangeLength: number;
}

export interface EditorChanges {
  text: string;
  changes: EditorChange[];
}

export interface TalonJsTestHelpers extends Omit<TestHelpers, "takeSnapshot"> {
  talonJsIDE: TalonJsIDE;
  ide: NormalizedIDE;
  storedTargets: StoredTargetMap;
  injectIde: (ide: IDE) => void;
}

export interface ActivateReturnValue {
  testHelpers?: TalonJsTestHelpers;
}
