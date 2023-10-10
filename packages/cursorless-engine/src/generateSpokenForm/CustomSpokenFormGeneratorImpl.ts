import {
  CommandComplete,
  Disposer,
  Listener,
  ScopeType,
} from "@cursorless/common";
import { SpokenFormGenerator } from ".";
import { CustomSpokenFormGenerator } from "..";
import { CustomSpokenForms } from "../CustomSpokenForms";
import { TalonSpokenForms } from "../scopeProviders/SpokenFormEntry";

export class CustomSpokenFormGeneratorImpl
  implements CustomSpokenFormGenerator
{
  private customSpokenForms: CustomSpokenForms;
  private spokenFormGenerator: SpokenFormGenerator;
  private disposer = new Disposer();

  constructor(talonSpokenForms: TalonSpokenForms) {
    this.customSpokenForms = new CustomSpokenForms(talonSpokenForms);
    this.spokenFormGenerator = new SpokenFormGenerator(this.customSpokenForms);
    this.disposer.push(
      this.customSpokenForms.onDidChangeCustomSpokenForms(() => {
        this.spokenFormGenerator = new SpokenFormGenerator(
          this.customSpokenForms,
        );
      }),
    );
  }

  onDidChangeCustomSpokenForms(listener: Listener<[]>) {
    return this.customSpokenForms.onDidChangeCustomSpokenForms(listener);
  }

  commandToSpokenForm(command: CommandComplete) {
    return this.spokenFormGenerator.command(command);
  }

  scopeTypeToSpokenForm(scopeType: ScopeType) {
    return this.spokenFormGenerator.scopeType(scopeType);
  }

  getCustomRegexScopeTypes() {
    return this.customSpokenForms.getCustomRegexScopeTypes();
  }

  get needsInitialTalonUpdate() {
    return this.customSpokenForms.needsInitialTalonUpdate;
  }

  dispose = this.disposer.dispose;
}
