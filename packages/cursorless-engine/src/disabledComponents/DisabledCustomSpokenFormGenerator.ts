import type {
  Disposable,
  Listener,
  ScopeType,
  SpokenForm,
} from "@cursorless/common";
import type { CustomSpokenFormGenerator } from "../api/CursorlessEngineApi";

export class DisabledCustomSpokenFormGenerator
  implements CustomSpokenFormGenerator
{
  needsInitialTalonUpdate = false;

  onDidChangeCustomSpokenForms(_listener: Listener): Disposable {
    return { dispose: () => {} };
  }

  getCustomRegexScopeTypes() {
    return [];
  }

  scopeTypeToSpokenForm(_scopeType: ScopeType): SpokenForm {
    return {
      type: "error",
      reason: "Custom spoken forms are disabled.",
      requiresTalonUpdate: false,
      isPrivate: false,
    };
  }
}
