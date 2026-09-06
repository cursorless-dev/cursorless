import { pull } from "lodash-es";
import type {
  Disposable,
  ScopeType,
  ScopeTypeInfo,
  ScopeTypeInfoEventCallback,
  SurroundingPairScopeType,
} from "@cursorless/lib-common";
import {
  isPseudoScopeType,
  scopeReferences,
  simpleScopeTypeTypes,
  surroundingPairNames,
} from "@cursorless/lib-common";
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

  private onChange() {
    this.updateScopeTypeInfos();

    for (const listener of this.listeners.slice()) {
      listener(this.scopeInfos);
    }
  }

  private updateScopeTypeInfos(): void {
    const scopeTypes: ScopeType[] = [
      ...simpleScopeTypeTypes
        // Create simple scope types from simple scope type types
        .map((scopeTypeType) => ({ type: scopeTypeType }))
        // Ignore pseudo-scope because it's not really a scope
        .filter((scopeType) => !isPseudoScopeType(scopeType)),

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
      isLanguageSpecific: scopeReferences[scopeType.type].isLanguageSpecific,
    };
  }

  dispose() {
    this.disposable.dispose();
  }
}
