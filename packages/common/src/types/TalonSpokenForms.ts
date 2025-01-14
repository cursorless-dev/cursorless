import type { Notifier } from "@cursorless/common";
import type { SpokenFormMapKeyTypes, SpokenFormType } from "./SpokenFormType";

/**
 * Interface representing a communication mechanism whereby Talon can provide
 * the user's custom spoken forms to the Cursorless engine.
 */
export interface TalonSpokenForms {
  getSpokenFormEntries(): Promise<SpokenFormEntry[]>;
  onDidChange: Notifier["registerListener"];
}

/**
 * The types of entries for which we currently support getting custom spoken
 * forms from Talon.
 */
export const SUPPORTED_ENTRY_TYPES = [
  "simpleScopeTypeType",
  "complexScopeTypeType",
  "customRegex",
  "pairedDelimiter",
  "action",
  "customAction",
  "grapheme",
] as const;

type SupportedEntryType = (typeof SUPPORTED_ENTRY_TYPES)[number];

export interface SpokenFormEntryForType<T extends SpokenFormType> {
  type: T;
  id: SpokenFormMapKeyTypes[T];
  spokenForms: string[];
}

export type SpokenFormEntry = {
  [K in SpokenFormType]: SpokenFormEntryForType<K>;
}[SupportedEntryType];

export class NeedsInitialTalonUpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NeedsInitialTalonUpdateError";
  }
}

export class DisabledCustomSpokenFormsError extends Error {
  constructor() {
    super("Custom spoken forms are not currently supported in this ide");
    this.name = "DisabledCustomSpokenFormsError";
  }
}
