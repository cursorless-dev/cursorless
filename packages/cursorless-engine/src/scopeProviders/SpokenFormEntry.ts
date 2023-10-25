import { Notifier, SimpleScopeTypeType } from "@cursorless/common";
import { SpeakableSurroundingPairName } from "../spokenForms/SpokenFormType";

/**
 * Interface representing a communication mechanism whereby Talon can provide
 * the user's custom spoken forms to the Cursorless engine.
 */
export interface TalonSpokenForms {
  getSpokenFormEntries(): Promise<SpokenFormEntry[]>;
  onDidChange: Notifier["registerListener"];
}

export interface CustomRegexSpokenFormEntry {
  type: "customRegex";
  id: string;
  spokenForms: string[];
}

export interface PairedDelimiterSpokenFormEntry {
  type: "pairedDelimiter";
  id: SpeakableSurroundingPairName;
  spokenForms: string[];
}

export interface SimpleScopeTypeTypeSpokenFormEntry {
  type: "simpleScopeTypeType";
  id: SimpleScopeTypeType;
  spokenForms: string[];
}

export type SpokenFormEntry =
  | CustomRegexSpokenFormEntry
  | PairedDelimiterSpokenFormEntry
  | SimpleScopeTypeTypeSpokenFormEntry;

export class NeedsInitialTalonUpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NeedsInitialTalonUpdateError";
  }
}
