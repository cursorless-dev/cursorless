import {
  CustomRegexScopeType,
  Disposable,
  FileSystem,
  ScopeType,
  SimpleScopeTypeType,
  SurroundingPairName,
  SurroundingPairScopeType,
  isSimpleScopeType,
  simpleScopeTypeTypes,
  surroundingPairNames,
} from "@cursorless/common";
import { pull } from "lodash";
import { ScopeTypeInfo, ScopeTypeInfoEventCallback } from "..";
import { Debouncer } from "../core/Debouncer";
import { homedir } from "os";
import * as path from "path";
import { scopeTypeToString } from "./scopeTypeToString";
import {
  CustomRegexSpokenFormEntry,
  PairedDelimiterSpokenFormEntry,
  SimpleScopeTypeTypeSpokenFormEntry,
  getSpokenFormEntries,
} from "./getSpokenFormEntries";

export const spokenFormsPath = path.join(
  homedir(),
  ".cursorless",
  "spokenForms.json",
);

/**
 * Maintains a list of all scope types and notifies listeners when it changes.
 */
export class ScopeInfoProvider {
  private disposables: Disposable[] = [];
  private debouncer = new Debouncer(() => this.onChange(), 250);
  private listeners: ScopeTypeInfoEventCallback[] = [];
  private simpleScopeTypeSpokenFormMap?: Record<SimpleScopeTypeType, string[]>;
  private pairedDelimiterSpokenFormMap?: Record<SurroundingPairName, string[]>;
  private customRegexSpokenFormMap?: Record<string, string[]>;
  private scopeInfos!: ScopeTypeInfo[];

  private constructor(fileSystem: FileSystem) {
    this.disposables.push(
      fileSystem.watch(spokenFormsPath, this.debouncer.run),
      this.debouncer,
    );

    this.onDidChangeScopeInfo = this.onDidChangeScopeInfo.bind(this);
  }

  static create(fileSystem: FileSystem) {
    const obj = new ScopeInfoProvider(fileSystem);
    obj.init();
    return obj;
  }

  private async init() {
    await this.updateScopeTypeInfos();
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
    this.updateScopeTypeInfos().then(() => callback(this.getScopeTypeInfos()));
    callback(this.getScopeTypeInfos());

    this.listeners.push(callback);

    return {
      dispose: () => {
        pull(this.listeners, callback);
      },
    };
  }

  private async onChange() {
    await this.updateScopeTypeInfos();

    this.listeners.forEach((listener) => listener(this.scopeInfos));
  }

  private async updateScopeTypeInfos(): Promise<void> {
    const update = () => {
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

        ...(this.customRegexSpokenFormMap == null
          ? []
          : Object.keys(this.customRegexSpokenFormMap)
        ).map(
          (regex): CustomRegexScopeType => ({ type: "customRegex", regex }),
        ),
      ];

      this.scopeInfos = scopeTypes.map((scopeType) =>
        this.getScopeTypeInfo(scopeType),
      );
    };

    update();

    return this.updateSpokenFormMaps().then(update);
  }

  private async updateSpokenFormMaps() {
    const entries = await getSpokenFormEntries();

    this.simpleScopeTypeSpokenFormMap = Object.fromEntries(
      entries
        .filter(
          (entry): entry is SimpleScopeTypeTypeSpokenFormEntry =>
            entry.type === "simpleScopeTypeType",
        )
        .map(({ id, spokenForms }) => [id, spokenForms] as const),
    );
    this.customRegexSpokenFormMap = Object.fromEntries(
      entries
        .filter(
          (entry): entry is CustomRegexSpokenFormEntry =>
            entry.type === "customRegex",
        )
        .map(({ id, spokenForms }) => [id, spokenForms] as const),
    );
    this.pairedDelimiterSpokenFormMap = Object.fromEntries(
      entries
        .filter(
          (entry): entry is PairedDelimiterSpokenFormEntry =>
            entry.type === "pairedDelimiter",
        )
        .map(({ id, spokenForms }) => [id, spokenForms] as const),
    );
  }

  getScopeTypeInfos(): ScopeTypeInfo[] {
    return this.scopeInfos;
  }

  getScopeTypeInfo(scopeType: ScopeType): ScopeTypeInfo {
    return {
      scopeType,
      spokenForms: this.getSpokenForms(scopeType),
      humanReadableName: scopeTypeToString(scopeType),
      isLanguageSpecific: isLanguageSpecific(scopeType),
    };
  }

  getSpokenForms(scopeType: ScopeType): string[] | undefined {
    if (isSimpleScopeType(scopeType)) {
      return this.simpleScopeTypeSpokenFormMap?.[scopeType.type];
    }

    if (scopeType.type === "surroundingPair") {
      return this.pairedDelimiterSpokenFormMap?.[scopeType.delimiter];
    }

    if (scopeType.type === "customRegex") {
      return this.customRegexSpokenFormMap?.[scopeType.regex];
    }

    return undefined;
  }

  dispose(): void {
    this.disposables.forEach(({ dispose }) => {
      try {
        dispose();
      } catch (e) {
        // do nothing; some of the VSCode disposables misbehave, and we don't
        // want that to prevent us from disposing the rest of the disposables
      }
    });
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
