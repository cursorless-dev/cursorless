import { LATEST_VERSION, SimpleScopeTypeType } from "@cursorless/common";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { SpeakableSurroundingPairName } from "../SpokenFormMap";
import * as path from "path";

export const spokenFormsPath = path.join(
  homedir(),
  ".cursorless",
  "spokenForms.json",
);

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

export async function getSpokenFormEntries(): Promise<SpokenFormEntry[]> {
  const payload = JSON.parse(await readFile(spokenFormsPath, "utf-8"));

  /**
   * This assignment is to ensure that the compiler will error if we forget to
   * handle spokenForms.json when we bump the command version.
   */
  const latestCommandVersion: 6 = LATEST_VERSION;

  if (payload.version !== latestCommandVersion) {
    // In the future, we'll need to handle migrations. Not sure exactly how yet.
    throw new Error(
      `Invalid spoken forms version. Expected ${LATEST_VERSION} but got ${payload.version}`,
    );
  }

  return payload.entries;
}
