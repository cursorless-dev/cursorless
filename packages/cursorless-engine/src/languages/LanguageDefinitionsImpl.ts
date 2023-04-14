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

/**
 * A list of languages which have query definitions.  Note that it's possible
 * for a language to have some of its scope types defined via queries and the
 * rest via legacy `nodeMatcher` definitions.  The
 * {@link LanguageDefinitionImpl} will return `undefined` for any scope types
 * which are not defined via queries, which will cause the modifier stage to
 * fall back to the legacy `nodeMatcher` definitions.
 */
const languages: LanguageId[] = ["ruby"];
