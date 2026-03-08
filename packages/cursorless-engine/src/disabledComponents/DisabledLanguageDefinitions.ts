import type { Listener } from "@cursorless/common";
import type { LanguageDefinition } from "../languages/LanguageDefinition";
import type { LanguageDefinitions } from "../languages/LanguageDefinitions";

export class DisabledLanguageDefinitions implements LanguageDefinitions {
  onDidChangeDefinition(_listener: Listener) {
    return { dispose: () => {} };
  }

  loadLanguage(_languageId: string): Promise<void> {
    return Promise.resolve();
  }

  get(_languageId: string): LanguageDefinition | undefined {
    return undefined;
  }

  dispose(): void {
    // Do nothing
  }
}
