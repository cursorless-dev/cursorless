export interface OffsetSelection {
  // Document offsets
  anchor: number;
  active: number;
}

export interface EditorState {
  text: string;
  selection: OffsetSelection;
}
