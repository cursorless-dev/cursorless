import { Disposable } from "@cursorless/common";

export interface LanguageDefinitionsProvider {
  onChanges(listener: () => void): Disposable;
  readQueryFile(filename: string): Promise<string | undefined>;
}
