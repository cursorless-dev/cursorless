import {
  CustomRegexScopeType,
  Disposer,
  FileSystem,
  Notifier,
} from "@cursorless/common";
import { homedir } from "os";
import * as path from "path";
import {
  CustomRegexSpokenFormEntry,
  PairedDelimiterSpokenFormEntry,
  SimpleScopeTypeTypeSpokenFormEntry,
  getSpokenFormEntries,
} from "./scopeProviders/getSpokenFormEntries";
import { SpokenFormMap } from "./SpokenFormMap";
import { defaultSpokenFormMap } from "./DefaultSpokenFormMap";

export const spokenFormsPath = path.join(
  homedir(),
  ".cursorless",
  "spokenForms.json",
);

/**
 * Maintains a list of all scope types and notifies listeners when it changes.
 */
export class CustomSpokenForms implements SpokenFormMap {
  private disposer = new Disposer();
  private notifier = new Notifier();

  // Initialize to defaults
  simpleScopeTypeType = defaultSpokenFormMap.simpleScopeTypeType;
  pairedDelimiter = defaultSpokenFormMap.pairedDelimiter;
  customRegex = defaultSpokenFormMap.customRegex;

  // FIXME: Get these from Talon
  surroundingPairForceDirection =
    defaultSpokenFormMap.surroundingPairForceDirection;
  simpleModifier = defaultSpokenFormMap.simpleModifier;
  modifierExtra = defaultSpokenFormMap.modifierExtra;

  private isInitialized_ = false;

  get isInitialized() {
    return this.isInitialized_;
  }

  private constructor(fileSystem: FileSystem) {
    this.disposer.push(
      fileSystem.watch(spokenFormsPath, () => this.updateSpokenFormMaps()),
    );

    this.updateSpokenFormMaps();
  }

  /**
   * Registers a callback to be run when the custom spoken forms change.
   * @param callback The callback to run when the scope ranges change
   * @returns A {@link Disposable} which will stop the callback from running
   */
  onDidChangeCustomSpokenForms = this.notifier.registerListener;

  private async updateSpokenFormMaps(): Promise<void> {
    const entries = await getSpokenFormEntries();

    this.simpleScopeTypeType = Object.fromEntries(
      entries
        .filter(
          (entry): entry is SimpleScopeTypeTypeSpokenFormEntry =>
            entry.type === "simpleScopeTypeType",
        )
        .map(({ id, spokenForms }) => [id, spokenForms] as const),
    );
    this.customRegex = Object.fromEntries(
      entries
        .filter(
          (entry): entry is CustomRegexSpokenFormEntry =>
            entry.type === "customRegex",
        )
        .map(({ id, spokenForms }) => [id, spokenForms] as const),
    );
    this.pairedDelimiter = Object.fromEntries(
      entries
        .filter(
          (entry): entry is PairedDelimiterSpokenFormEntry =>
            entry.type === "pairedDelimiter",
        )
        .map(({ id, spokenForms }) => [id, spokenForms] as const),
    );

    this.notifier.notifyListeners();
  }

  getCustomRegexScopeTypes(): CustomRegexScopeType[] {
    return Object.keys(this.customRegex).map((regex) => ({
      type: "customRegex",
      regex,
    }));
  }

  dispose = this.disposer.dispose;
}
