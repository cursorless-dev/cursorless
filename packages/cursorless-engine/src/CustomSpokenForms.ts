import {
  CustomRegexScopeType,
  Disposer,
  FileSystem,
  Notifier,
  showError,
} from "@cursorless/common";
import { isEqual } from "lodash";
import {
  defaultSpokenFormInfo,
  defaultSpokenFormMap,
} from "./DefaultSpokenFormMap";
import {
  SpokenFormMap,
  SpokenFormMapEntry,
  SpokenFormType,
} from "./SpokenFormMap";
import {
  SpokenFormEntry,
  getSpokenFormEntries,
  spokenFormsPath,
} from "./scopeProviders/getSpokenFormEntries";
import { ide } from "./singletons/ide.singleton";
import { dirname } from "node:path";

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

  constructor(fileSystem: FileSystem) {
    this.disposer.push(
      fileSystem.watch(dirname(spokenFormsPath), () =>
        this.updateSpokenFormMaps(),
      ),
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
      entries = await getSpokenFormEntries();
    } catch (err) {
      if ((err as any)?.code === "ENOENT") {
        // Handle case where spokenForms.json doesn't exist yet
        console.log(
          `Custom spoken forms file not found at ${spokenFormsPath}. Using default spoken forms.`,
        );
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
      // TODO: Handle case where we've added a new scope type but they haven't yet
      // updated their talon files. In that case we want to indicate in tree view
      // that the scope type exists but they need to update their talon files to
      // be able to speak it. We could just detect that there's no entry for it in
      // the spoken forms file, but that feels a bit brittle.
      // FIXME: How to avoid the type assertion?
      const entry = Object.fromEntries(
        entries
          .filter((entry) => entry.type === entryType)
          .map(({ id, spokenForms }) => [id, spokenForms]),
      );

      this[entryType] = Object.fromEntries(
        Object.entries(defaultSpokenFormInfo[entryType]).map(
          ([key, { defaultSpokenForms, isSecret }]): [
            SpokenFormType,
            SpokenFormMapEntry,
          ] => {
            const customSpokenForms = entry[key];
            if (customSpokenForms != null) {
              return [
                key as SpokenFormType,
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
                key as SpokenFormType,
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
          },
        ),
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
