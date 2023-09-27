import { SimpleScopeTypeType } from "@cursorless/common";
import { readFile } from "fs/promises";
import { spokenFormsPath } from "./ScopeInfoProvider";
import { SpeakableSurroundingPairName } from "../SpokenFormMap";

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

type SpokenFormEntry =
  | CustomRegexSpokenFormEntry
  | PairedDelimiterSpokenFormEntry
  | SimpleScopeTypeTypeSpokenFormEntry;

export async function getSpokenFormEntries(): Promise<SpokenFormEntry[]> {
  try {
    return JSON.parse(await readFile(spokenFormsPath, "utf-8")).entries;
  } catch (err) {
    console.error(`Error getting spoken forms`);
    console.error(err);
    return [];
  }
}
