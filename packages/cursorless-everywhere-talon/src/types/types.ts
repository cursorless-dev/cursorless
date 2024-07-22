export interface OffsetSelection {
  // Document offsets
  anchor: number;
  active: number;
}

export interface EditorState {
  text: string;
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
