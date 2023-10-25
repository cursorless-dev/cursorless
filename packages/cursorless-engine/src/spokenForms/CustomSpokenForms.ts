import {
  CustomRegexScopeType,
  Disposer,
  Notifier,
  showError,
} from "@cursorless/common";
import { isEqual } from "lodash";
import {
  NeedsInitialTalonUpdateError,
  SpokenFormEntry,
  TalonSpokenForms,
} from "../scopeProviders/SpokenFormEntry";
import { ide } from "../singletons/ide.singleton";
import { SpokenFormMap, SpokenFormMapEntry } from "./SpokenFormMap";
import { SpokenFormType } from "./SpokenFormType";
import {
  defaultSpokenFormInfoMap,
  defaultSpokenFormMap,
} from "./defaultSpokenFormMap";
import { DefaultSpokenFormMapEntry } from "./defaultSpokenFormMap.types";

/**
 * The types of entries for which we currently support getting custom spoken
 * forms from Talon.
 */
const ENTRY_TYPES = [
  "simpleScopeTypeType",
  "customRegex",
  "pairedDelimiter",
] as const;

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

/**
 * Maintains a {@link SpokenFormMap} containing the users's custom spoken forms. If
 * for some reason, the custom spoken forms cannot be loaded, the default spoken
 * forms will be used instead. We currently only support getting custom spoken
 * forms for a subset of all customizable spoken forms.
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
    let allCustomEntries: SpokenFormEntry[];
    try {
      allCustomEntries = await this.talonSpokenForms.getSpokenFormEntries();
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
      const customEntries = Object.fromEntries(
        allCustomEntries
          .filter((entry) => entry.type === entryType)
          .map(({ id, spokenForms }) => [id, spokenForms]),
      );

      const defaultEntries: Partial<Record<string, DefaultSpokenFormMapEntry>> =
        defaultSpokenFormInfoMap[entryType];

      /**
       * The ids of the entries to include in the spoken form map. We need a
       * union of the ids from the default entry and the custom entry. The custom
       * entry could be missing private entries, or it could be missing entries
       * because the Talon side is old. The default entry could be missing entries
       * like custom regexes, where the user can create arbitrary ids.
       */
      const ids = Array.from(
        new Set([
          ...Object.keys(defaultEntries),
          ...Object.keys(customEntries),
        ]),
      );
      // FIXME: How to avoid the type assertions here?
      this.spokenFormMap_[entryType] = Object.fromEntries(
        ids.map((id): [SpokenFormType, SpokenFormMapEntry] => {
          const { defaultSpokenForms = [], isPrivate = false } =
            defaultEntries[id] ?? {};
          const customSpokenForms = customEntries[id];
          if (customSpokenForms != null) {
            return [
              id as SpokenFormType,
              {
                defaultSpokenForms,
                spokenForms: customSpokenForms,
                requiresTalonUpdate: false,
                isCustom: isEqual(defaultSpokenForms, customSpokenForms),
                isPrivate,
              },
            ];
          } else {
            return [
              id as SpokenFormType,
              {
                defaultSpokenForms,
                spokenForms: [],
                // If it's not a private spoken form, then it's a new scope type
                requiresTalonUpdate: !isPrivate,
                isCustom: false,
                isPrivate,
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
