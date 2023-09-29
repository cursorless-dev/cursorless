import {
  CommandComplete,
  Disposer,
  FileSystem,
  Listener,
  ScopeType,
} from "@cursorless/common";
import { SpokenFormGenerator } from ".";
import { CustomSpokenForms } from "../CustomSpokenForms";

export class CustomSpokenFormGenerator {
  private customSpokenForms: CustomSpokenForms;
  private spokenFormGenerator: SpokenFormGenerator;
  private disposer = new Disposer();

  constructor(fileSystem: FileSystem) {
    this.customSpokenForms = new CustomSpokenForms(fileSystem);
    this.spokenFormGenerator = new SpokenFormGenerator(this.customSpokenForms);
    this.disposer.push(
      this.customSpokenForms.onDidChangeCustomSpokenForms(() => {
        this.spokenFormGenerator = new SpokenFormGenerator(
          this.customSpokenForms,
        );
      }),
    );
  }

  onDidChangeCustomSpokenForms = (listener: Listener<[]>) =>
    this.customSpokenForms.onDidChangeCustomSpokenForms(listener);

  commandToSpokenForm = (command: CommandComplete) =>
    this.spokenFormGenerator.command(command);

  scopeTypeToSpokenForm = (scopeType: ScopeType) =>
    this.spokenFormGenerator.scopeType(scopeType);

  getCustomRegexScopeTypes = () =>
    this.customSpokenForms.getCustomRegexScopeTypes();
}
