export interface OffsetSelection {
  // Document offsets
  anchor: number;
  active: number;
}

export interface DocumentState {
  text: string;
  selection: OffsetSelection;
}
