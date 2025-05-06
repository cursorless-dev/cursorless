import type {
  ActionType,
  CommandComplete,
  Disposable,
  Listener,
  ScopeType,
} from "@cursorless/common";
import { SpokenFormGenerator } from "./generateSpokenForm";
import type { CustomSpokenFormGenerator } from "../api/CursorlessEngineApi";
import { CustomSpokenForms } from "../spokenForms/CustomSpokenForms";
import type { TalonSpokenForms } from "@cursorless/common";

/**
 * Simple facade that combines the {@link CustomSpokenForms} and
 * {@link SpokenFormGenerator} classes. Its main purpose is to reconstruct the
 * {@link SpokenFormGenerator} when the {@link CustomSpokenForms} change.
 */
export class CustomSpokenFormGeneratorImpl
  implements CustomSpokenFormGenerator
{
  private customSpokenForms: CustomSpokenForms;
  private spokenFormGenerator: SpokenFormGenerator;
  private disposable: Disposable;

  /**
   * A promise that resolves when the custom spoken forms have been loaded.
   */
  public readonly customSpokenFormsInitialized: Promise<void>;

  constructor(talonSpokenForms: TalonSpokenForms) {
    this.customSpokenForms = new CustomSpokenForms(talonSpokenForms);
    this.customSpokenFormsInitialized =
      this.customSpokenForms.customSpokenFormsInitialized;
    this.spokenFormGenerator = new SpokenFormGenerator(
      this.customSpokenForms.spokenFormMap,
    );
    this.disposable = this.customSpokenForms.onDidChangeCustomSpokenForms(
      () => {
        this.spokenFormGenerator = new SpokenFormGenerator(
          this.customSpokenForms.spokenFormMap,
        );
      },
    );
  }

  onDidChangeCustomSpokenForms(listener: Listener<[]>) {
    return this.customSpokenForms.onDidChangeCustomSpokenForms(listener);
  }

  commandToSpokenForm(command: CommandComplete) {
    return this.spokenFormGenerator.processCommand(command);
  }

  scopeTypeToSpokenForm(scopeType: ScopeType) {
    return this.spokenFormGenerator.processScopeType(scopeType);
  }

  actionIdToSpokenForm(actionId: ActionType) {
    return this.spokenFormGenerator.getSpokenFormForSingleTerm(
      "action",
      actionId,
    );
  }

  graphemeToSpokenForm(grapheme: string) {
    return this.spokenFormGenerator.getSpokenFormForSingleTerm(
      "grapheme",
      grapheme,
    );
  }

  getCustomRegexScopeTypes() {
    return this.customSpokenForms.getCustomRegexScopeTypes();
  }

  get needsInitialTalonUpdate() {
    return this.customSpokenForms.needsInitialTalonUpdate;
  }

  dispose() {
    this.disposable.dispose();
  }
}
