export type SectionName = "actions" |
  "colors" |
  "misc" |
  "scopes" |
  "shapes" |
  "vscodeCommands";
export interface KeyHandler<T, V> {
  sectionName: SectionName;
  value: T;
  handleValue(): Promise<V>;
}
