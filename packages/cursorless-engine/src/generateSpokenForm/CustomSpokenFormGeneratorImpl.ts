import {
  CommandComplete,
  Disposer,
  Listener,
  ScopeType,
} from "@cursorless/common";
import { SpokenFormGenerator } from ".";
import { CustomSpokenFormGenerator } from "..";
import { CustomSpokenForms } from "../spokenForms/CustomSpokenForms";
import { TalonSpokenForms } from "../scopeProviders/SpokenFormEntry";

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
  private disposer = new Disposer();

  constructor(talonSpokenForms: TalonSpokenForms) {
    this.customSpokenForms = new CustomSpokenForms(talonSpokenForms);
    this.spokenFormGenerator = new SpokenFormGenerator(
      this.customSpokenForms.spokenFormMap,
    );
    this.disposer.push(
      this.customSpokenForms.onDidChangeCustomSpokenForms(() => {
        this.spokenFormGenerator = new SpokenFormGenerator(
          this.customSpokenForms.spokenFormMap,
        );
      }),
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

  getCustomRegexScopeTypes() {
    return this.customSpokenForms.getCustomRegexScopeTypes();
  }

  get needsInitialTalonUpdate() {
    return this.customSpokenForms.needsInitialTalonUpdate;
  }

  dispose() {
    this.disposer.dispose();
  }
}
