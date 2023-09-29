import {
  Disposable,
  Disposer,
  ScopeType,
  SurroundingPairScopeType,
  simpleScopeTypeTypes,
  surroundingPairNames,
} from "@cursorless/common";
import { pull } from "lodash";
import { homedir } from "os";
import * as path from "path";
import { ScopeTypeInfo, ScopeTypeInfoEventCallback } from "..";

import { CustomSpokenFormGenerator } from "../generateSpokenForm/CustomSpokenFormGenerator";
import { scopeTypeToString } from "./scopeTypeToString";

export const spokenFormsPath = path.join(
  homedir(),
  ".cursorless",
  "spokenForms.json",
);

/**
 * Maintains a list of all scope types and notifies listeners when it changes.
 */
export class ScopeInfoProvider {
  private disposer = new Disposer();
  private listeners: ScopeTypeInfoEventCallback[] = [];
  private scopeInfos!: ScopeTypeInfo[];

  constructor(private customSpokenFormGenerator: CustomSpokenFormGenerator) {
    this.disposer.push(
      customSpokenFormGenerator.onDidChangeCustomSpokenForms(() =>
        this.onChange(),
      ),
    );

    this.onDidChangeScopeInfo = this.onDidChangeScopeInfo.bind(this);
    this.updateScopeTypeInfos();
  }

  /**
   * Registers a callback to be run when the scope ranges change for any visible
   * editor.  The callback will be run immediately once for each visible editor
   * with the current scope ranges.
   * @param callback The callback to run when the scope ranges change
   * @param config The configuration for the scope ranges
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
        // Ignore instance pseudo-scope for now
        // Skip "string" because we use surrounding pair for that
        .filter(
          (scopeTypeType) =>
            scopeTypeType !== "instance" && scopeTypeType !== "string",
        )
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
    case "switchStatementSubject":
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
      return true;

    case "character":
    case "word":
    case "token":
    case "identifier":
    case "line":
    case "sentence":
    case "paragraph":
    case "document":
    case "nonWhitespaceSequence":
    case "boundedNonWhitespaceSequence":
    case "url":
    case "notebookCell":
    case "surroundingPair":
    case "customRegex":
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
