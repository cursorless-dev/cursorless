import {
  CustomRegexScopeType,
  Disposer,
  FileSystem,
  Notifier,
} from "@cursorless/common";
import { homedir } from "os";
import * as path from "path";
import { getSpokenFormEntries } from "./scopeProviders/getSpokenFormEntries";
import { SpokenFormMap } from "./SpokenFormMap";
import { defaultSpokenFormMap } from "./DefaultSpokenFormMap";

export const spokenFormsPath = path.join(
  homedir(),
  ".cursorless",
  "spokenForms.json",
);

const ENTRY_TYPES = [
  "simpleScopeTypeType",
  "customRegex",
  "pairedDelimiter",
] as const;

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

  /**
   * Whether the custom spoken forms have been initialized. If `false`, the
   * default spoken forms are currently being used while the custom spoken forms
   * are being loaded.
   */
  get isInitialized() {
    return this.isInitialized_;
  }

  constructor(fileSystem: FileSystem) {
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

    for (const entryType of ENTRY_TYPES) {
      // TODO: Handle case where we've added a new scope type but they haven't yet
      // updated their talon files. In that case we want to indicate in tree view
      // that the scope type exists but they need to update their talon files to
      // be able to speak it. We could just detect that there's no entry for it in
      // the spoken forms file, but that feels a bit brittle.
      // FIXME: How to avoid the type assertion?
      this[entryType] = Object.fromEntries(
        entries
          .filter((entry) => entry.type === entryType)
          .map(({ id, spokenForms }) => [id, spokenForms]),
      ) as any;
    }

    this.isInitialized_ = true;
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
