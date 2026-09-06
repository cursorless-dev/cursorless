import {
  numberDefaultSpokenForms,
  ordinalDefaultSpokenForms,
} from "@cursorless/lib-common";

export function numberToSpokenForm(number: number): string {
  const result = numberDefaultSpokenForms[number];
  if (result == null) {
    throw new Error(`Unknown number '${number}'`);
  }
  return result;
}

export function ordinalToSpokenForm(ordinal: number): string {
  const result = ordinalDefaultSpokenForms[ordinal];
  if (result == null) {
    throw new Error(`Unknown ordinal '${ordinal}'`);
  }
  return result;
}
