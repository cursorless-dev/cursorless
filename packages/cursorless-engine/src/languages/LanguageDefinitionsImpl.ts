import { TreeSitter } from "..";
import { LanguageDefinition, LanguageDefinitions } from "./LanguageDefinitions";
import { LanguageId } from "./constants";
import { LanguageDefinitionImpl } from "./LanguageDefinitionImpl";

export class LanguageDefinitionsImpl implements LanguageDefinitions {
  private languageDefinitions: Map<LanguageId, LanguageDefinitionImpl> =
    new Map();

  constructor(private treeSitter: TreeSitter) {}

  get(languageId: LanguageId): LanguageDefinition | undefined {
    if (!languages.includes(languageId)) {
      return undefined;
    }

    let definition = this.languageDefinitions.get(languageId);

    if (definition == null) {
      definition = new LanguageDefinitionImpl(this.treeSitter, languageId);
      definition.init();
      this.languageDefinitions.set(languageId, definition);
    }

    return definition;
  }
}

const languages: LanguageId[] = ["ruby"];
