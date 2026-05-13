import { isEqual } from "lodash-es";
import type {
  CustomRegexScopeType,
  Disposable,
  IDE,
  SpokenFormEntry,
  SpokenFormMapKeyTypes,
  SpokenFormType,
  TalonSpokenForms,
} from "@cursorless/lib-common";
import {
  DisabledCustomSpokenFormsError,
  NeedsInitialTalonUpdateError,
  Notifier,
  SUPPORTED_ENTRY_TYPES,
  getErrorMessage,
  showError,
} from "@cursorless/lib-common";
import {
  defaultSpokenFormInfoMap,
  defaultSpokenFormMap,
} from "./defaultSpokenFormMap";
import type { DefaultSpokenFormMapEntry } from "./defaultSpokenFormMap.types";
import type { SpokenFormMap, SpokenFormMapEntry } from "./SpokenFormMap";

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
  private disposable: Disposable;
  private notifier = new Notifier();

  /**
   * A promise that resolves when the custom spoken forms have been loaded.
   */
  public readonly customSpokenFormsInitialized: Promise<void>;

  private spokenFormMap_: Writable<SpokenFormMap> = { ...defaultSpokenFormMap };

  get spokenFormMap(): SpokenFormMap {
    return this.spokenFormMap_;
  }

  private needsInitialTalonUpdate_: boolean | undefined;

  /**
   * If `true`, indicates they need to update their Talon files to get the
   * machinery used to share spoken forms from Talon to the VSCode extension.
   */
  get needsInitialTalonUpdate() {
    return this.needsInitialTalonUpdate_;
  }

  constructor(
    private ide: IDE,
    private talonSpokenForms: TalonSpokenForms,
  ) {
    this.disposable = talonSpokenForms.onDidChange(() =>
      this.updateSpokenFormMaps(),
    );

    this.customSpokenFormsInitialized = this.updateSpokenFormMaps();
  }

  /**
   * Registers a callback to be run when the custom spoken forms change.
   * @param callback The callback to run when the scope ranges change
   * @returns A {@link Disposable} which will stop the callback from running
   */
  onDidChangeCustomSpokenForms = this.notifier.registerListener;

  private async updateSpokenFormMaps(): Promise<void> {
    let allCustomEntries: SpokenFormEntry[];

    // We successfully loaded spoken forms, so any previous "needs update"
    // state is no longer relevant.
    this.needsInitialTalonUpdate_ = false;

    try {
      allCustomEntries = await this.talonSpokenForms.getSpokenFormEntries();
      if (allCustomEntries.length === 0) {
        throw new Error("Custom spoken forms list empty");
      }
    } catch (error) {
      if (error instanceof NeedsInitialTalonUpdateError) {
        // Handle case where spokenForms.json doesn't exist yet
        this.needsInitialTalonUpdate_ = true;
      } else if (error instanceof DisabledCustomSpokenFormsError) {
        // Do nothing: this ide doesn't currently support custom spoken forms
      } else {
        console.error("Error loading custom spoken forms", error);
        const msg = getErrorMessage(error).replace(/\.$/u, "");
        void showError(
          this.ide.messages,
          "CustomSpokenForms.updateSpokenFormMaps",
          `Error loading custom spoken forms: ${msg}. Falling back to default spoken forms.`,
        );
      }

      this.spokenFormMap_ = { ...defaultSpokenFormMap };
      this.notifier.notifyListeners();

      return;
    }

    for (const entryType of SUPPORTED_ENTRY_TYPES) {
      updateEntriesForType(
        this.spokenFormMap_,
        entryType,
        defaultSpokenFormInfoMap[entryType],
        Object.fromEntries(
          allCustomEntries
            .filter((entry) => entry.type === entryType)
            .map(({ id, spokenForms }) => [id, spokenForms]),
        ),
      );
    }

    this.notifier.notifyListeners();
  }

  getCustomRegexScopeTypes(): CustomRegexScopeType[] {
    return Object.keys(this.spokenFormMap_.customRegex).map((regex) => ({
      type: "customRegex",
      regex,
    }));
  }

  dispose() {
    this.disposable.dispose();
  }
}

function updateEntriesForType<T extends SpokenFormType>(
  spokenFormMapToUpdate: Writable<SpokenFormMap>,
  key: T,
  defaultEntries: Partial<
    Record<SpokenFormMapKeyTypes[T], DefaultSpokenFormMapEntry>
  >,
  customEntries: Partial<Record<SpokenFormMapKeyTypes[T], string[]>>,
) {
  /**
   * The ids of the entries to include in the spoken form map. We need a
   * union of the ids from the default entry and the custom entry. The custom
   * entry could be missing private entries, or it could be missing entries
   * because the Talon side is old. The default entry could be missing entries
   * like custom regexes, where the user can create arbitrary ids.
   */
  const ids = Array.from(
    new Set([...Object.keys(defaultEntries), ...Object.keys(customEntries)]),
  ) as SpokenFormMapKeyTypes[T][];

  const obj: Partial<Record<SpokenFormMapKeyTypes[T], SpokenFormMapEntry>> = {};
  for (const id of ids) {
    const { defaultSpokenForms = [], isPrivate = false } =
      defaultEntries[id] ?? {};
    const customSpokenForms = customEntries[id];

    // No entry for the given id. This either means that the user needs to
    // update Talon, or it's a private spoken form.
    if (customSpokenForms == null) {
      obj[id] = {
        defaultSpokenForms,
        spokenForms: [],
        // If it's not a private spoken form, then it's a new scope type
        requiresTalonUpdate: !isPrivate,
        isCustom: false,
        isPrivate,
      };
    }
    // We have an entry for the given id
    else {
      obj[id] = {
        defaultSpokenForms,
        spokenForms: customSpokenForms,
        requiresTalonUpdate: false,
        isCustom: !isEqual(defaultSpokenForms, customSpokenForms),
        isPrivate,
      };
    }
  }

  spokenFormMapToUpdate[key] = obj as SpokenFormMap[T];
}
