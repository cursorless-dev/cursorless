import {
  CustomRegexScopeType,
  Disposer,
  Notifier,
  showError,
} from "@cursorless/common";
import { isEqual } from "lodash";
import {
  DefaultSpokenFormMapEntry,
  defaultSpokenFormInfo,
  defaultSpokenFormMap,
} from "./DefaultSpokenFormMap";
import {
  SpokenFormMap,
  SpokenFormMapEntry,
  SpokenFormType,
} from "./SpokenFormMap";
import {
  NeedsInitialTalonUpdateError,
  SpokenFormEntry,
  TalonSpokenForms,
} from "./scopeProviders/SpokenFormEntry";
import { ide } from "./singletons/ide.singleton";

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
  private needsInitialTalonUpdate_: boolean | undefined;

  /**
   * If `true`, indicates they need to update their Talon files to get the
   * machinery used to share spoken forms from Talon to the VSCode extension.
   */
  get needsInitialTalonUpdate() {
    return this.needsInitialTalonUpdate_;
  }

  /**
   * Whether the custom spoken forms have been initialized. If `false`, the
   * default spoken forms are currently being used while the custom spoken forms
   * are being loaded.
   */
  get isInitialized() {
    return this.isInitialized_;
  }

  constructor(private talonSpokenForms: TalonSpokenForms) {
    this.disposer.push(
      talonSpokenForms.onDidChange(() => this.updateSpokenFormMaps()),
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
    let entries: SpokenFormEntry[];
    try {
      entries = await this.talonSpokenForms.getSpokenFormEntries();
    } catch (err) {
      if (err instanceof NeedsInitialTalonUpdateError) {
        // Handle case where spokenForms.json doesn't exist yet
        console.log(err.message);
        this.needsInitialTalonUpdate_ = true;
        this.notifier.notifyListeners();
      } else {
        console.error("Error loading custom spoken forms", err);
        showError(
          ide().messages,
          "CustomSpokenForms.updateSpokenFormMaps",
          `Error loading custom spoken forms: ${
            (err as Error).message
          }}}. Falling back to default spoken forms.`,
        );
      }

      return;
    }

    for (const entryType of ENTRY_TYPES) {
      // FIXME: How to avoid the type assertion?
      const entry = Object.fromEntries(
        entries
          .filter((entry) => entry.type === entryType)
          .map(({ id, spokenForms }) => [id, spokenForms]),
      );

      const defaultEntry: Partial<Record<string, DefaultSpokenFormMapEntry>> =
        defaultSpokenFormInfo[entryType];
      const ids = Array.from(
        new Set([...Object.keys(defaultEntry), ...Object.keys(entry)]),
      );
      this[entryType] = Object.fromEntries(
        ids.map((id): [SpokenFormType, SpokenFormMapEntry] => {
          const { defaultSpokenForms = [], isSecret = false } =
            defaultEntry[id] ?? {};
          const customSpokenForms = entry[id];
          if (customSpokenForms != null) {
            return [
              id as SpokenFormType,
              {
                defaultSpokenForms,
                spokenForms: customSpokenForms,
                requiresTalonUpdate: false,
                isCustom: isEqual(defaultSpokenForms, customSpokenForms),
                isSecret,
              },
            ];
          } else {
            return [
              id as SpokenFormType,
              {
                defaultSpokenForms,
                spokenForms: [],
                // If it's not a secret spoken form, then it's a new scope type
                requiresTalonUpdate: !isSecret,
                isCustom: false,
                isSecret,
              },
            ];
          }
        }),
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
