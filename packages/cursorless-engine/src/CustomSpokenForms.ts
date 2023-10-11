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

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

/**
 * Maintains a list of all scope types and notifies listeners when it changes.
 */
export class CustomSpokenForms {
  private disposer = new Disposer();
  private notifier = new Notifier();

  private spokenFormMap_: Writable<SpokenFormMap> = { ...defaultSpokenFormMap };

  get spokenFormMap(): SpokenFormMap {
    return this.spokenFormMap_;
  }

  private customSpokenFormsInitialized_ = false;
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
  get customSpokenFormsInitialized() {
    return this.customSpokenFormsInitialized_;
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
        this.needsInitialTalonUpdate_ = true;
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

      this.spokenFormMap_ = { ...defaultSpokenFormMap };
      this.customSpokenFormsInitialized_ = false;
      this.notifier.notifyListeners();

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
      this.spokenFormMap_[entryType] = Object.fromEntries(
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

    this.customSpokenFormsInitialized_ = true;
    this.notifier.notifyListeners();
  }

  getCustomRegexScopeTypes(): CustomRegexScopeType[] {
    return Object.keys(this.spokenFormMap_.customRegex).map((regex) => ({
      type: "customRegex",
      regex,
    }));
  }

  dispose = this.disposer.dispose;
}
