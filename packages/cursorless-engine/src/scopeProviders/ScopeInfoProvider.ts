import type {
  Disposable,
  ScopeType,
  ScopeTypeInfo,
  ScopeTypeInfoEventCallback,
  SurroundingPairScopeType,
} from "@cursorless/common";
import { simpleScopeTypeTypes, surroundingPairNames } from "@cursorless/common";
import { pull } from "lodash-es";

import type { CustomSpokenFormGeneratorImpl } from "../generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { scopeTypeToString } from "./scopeTypeToString";

/**
 * Maintains a list of all scope types and notifies listeners when it changes.
 */
export class ScopeInfoProvider {
  private disposable: Disposable;
  private listeners: ScopeTypeInfoEventCallback[] = [];
  private scopeInfos!: ScopeTypeInfo[];

  constructor(
    private customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
  ) {
    this.disposable = customSpokenFormGenerator.onDidChangeCustomSpokenForms(
      () => this.onChange(),
    );

    this.onDidChangeScopeInfo = this.onDidChangeScopeInfo.bind(this);
    this.getScopeTypeInfo = this.getScopeTypeInfo.bind(this);
    this.updateScopeTypeInfos();
  }

  /**
   * Registers a callback to be run when the scope info changes.  The callback
   * will be run immediately once with the current scope info.
   *
   * Includes information about the available scopes, including their custom
   * spoken forms, if available. Note that even custom regex scopes will be
   * available, as reported to the engine by Talon.
   * @param callback The callback to run when the scope support changes
   * @returns A {@link Disposable} which will stop the callback from running
   */
  onDidChangeScopeInfo(callback: ScopeTypeInfoEventCallback): Disposable {
    callback(this.getScopeTypeInfos());

    this.listeners.push(callback);

    return {
      dispose: () => {
        pull(this.listeners, callback);
      },
    };
  }

  private async onChange() {
    this.updateScopeTypeInfos();

    this.listeners.forEach((listener) => listener(this.scopeInfos));
  }

  private updateScopeTypeInfos(): void {
    const scopeTypes: ScopeType[] = [
      ...simpleScopeTypeTypes
        // Ignore instance pseudo-scope because it's not really a scope
        .filter((scopeTypeType) => scopeTypeType !== "instance")
        .map((scopeTypeType) => ({
          type: scopeTypeType,
        })),

      ...surroundingPairNames.map(
        (surroundingPairName): SurroundingPairScopeType => ({
          type: "surroundingPair",
          delimiter: surroundingPairName,
        }),
      ),

      ...this.customSpokenFormGenerator.getCustomRegexScopeTypes(),
    ];

    this.scopeInfos = scopeTypes.map((scopeType) =>
      this.getScopeTypeInfo(scopeType),
    );
  }

  getScopeTypeInfos(): ScopeTypeInfo[] {
    return this.scopeInfos;
  }

  getScopeTypeInfo(scopeType: ScopeType): ScopeTypeInfo {
    return {
      scopeType,
      spokenForm:
        this.customSpokenFormGenerator.scopeTypeToSpokenForm(scopeType),
      humanReadableName: scopeTypeToString(scopeType),
      isLanguageSpecific: isLanguageSpecific(scopeType),
    };
  }

  dispose() {
    this.disposable.dispose();
  }
}

/**
 * @param scopeType The scope type to check
 * @returns A boolean indicating whether the given scope type is defined on a
 * per-language basis.
 */
function isLanguageSpecific(scopeType: ScopeType): boolean {
  switch (scopeType.type) {
    case "string":
    case "argumentOrParameter":
    case "anonymousFunction":
    case "attribute":
    case "branch":
    case "class":
    case "className":
    case "collectionItem":
    case "collectionKey":
    case "command":
    case "comment":
    case "private.fieldAccess":
    case "functionCall":
    case "functionCallee":
    case "functionName":
    case "ifStatement":
    case "instance":
    case "list":
    case "map":
    case "name":
    case "namedFunction":
    case "regularExpression":
    case "statement":
    case "type":
    case "value":
    case "condition":
    case "section":
    case "sectionLevelOne":
    case "sectionLevelTwo":
    case "sectionLevelThree":
    case "sectionLevelFour":
    case "sectionLevelFive":
    case "sectionLevelSix":
    case "selector":
    case "private.switchStatementSubject":
    case "unit":
    case "xmlBothTags":
    case "xmlElement":
    case "xmlEndTag":
    case "xmlStartTag":
    case "part":
    case "chapter":
    case "subSection":
    case "subSubSection":
    case "namedParagraph":
    case "subParagraph":
    case "environment":
    case "textFragment":
    case "disqualifyDelimiter":
    case "pairDelimiter":
      return true;

    case "character":
    case "word":
    case "token":
    case "identifier":
    case "line":
    case "sentence":
    case "paragraph":
    case "boundedParagraph":
    case "document":
    case "nonWhitespaceSequence":
    case "boundedNonWhitespaceSequence":
    case "url":
    case "notebookCell":
    case "surroundingPair":
    case "surroundingPairInterior":
    case "customRegex":
    case "glyph":
      return false;

    case "oneOf":
      throw Error(
        `Can't decide whether scope type ${JSON.stringify(
          scopeType,
          undefined,
          3,
        )} is language-specific`,
      );
  }
}
