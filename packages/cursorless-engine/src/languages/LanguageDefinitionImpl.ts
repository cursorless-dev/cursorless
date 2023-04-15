import { ScopeType, SimpleScopeType } from "@cursorless/common";
import { Query } from "web-tree-sitter";
import { LanguageDefinition } from "./LanguageDefinitions";
import { LanguageId } from "./constants";
import { ide } from "../singletons/ide.singleton";
import { join } from "path";
import { TreeSitterScopeHandler } from "../processTargets/modifiers/scopeHandlers";
import { TreeSitter } from "../typings/TreeSitter";
import { readFileSync } from "fs";

export class LanguageDefinitionImpl implements LanguageDefinition {
  private query!: Query;

  constructor(private treeSitter: TreeSitter, private languageId: LanguageId) {}

  init() {
    const rawLanguageQueryString = readFileSync(
      join(ide().assetsRoot, "queries", `${this.languageId}.scm`),
      "utf8",
    );

    this.query = this.treeSitter
      .getLanguage(this.languageId)!
      .query(rawLanguageQueryString);
  }

  maybeGetLanguageScopeHandler(scopeType: ScopeType) {
    if (!this.query.captureNames.includes(scopeType.type)) {
      return undefined;
    }

    return new TreeSitterScopeHandler(
      this.treeSitter,
      this.query,
      scopeType as SimpleScopeType,
    );
  }
}
