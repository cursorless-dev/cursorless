import { LATEST_VERSION, SimpleScopeTypeType } from "@cursorless/common";
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
    const payload = JSON.parse(await readFile(spokenFormsPath, "utf-8"));

    if (payload.version !== LATEST_VERSION) {
      // In the future, we'll need to handle migrations. Not sure exactly how yet.
      throw new Error(
        `Invalid spoken forms version. Expected ${LATEST_VERSION} but got ${payload.version}`,
      );
    }

    return payload.entries;
  } catch (err) {
    console.error(`Error getting spoken forms`);
    console.error(err);
    return [];
  }
}
