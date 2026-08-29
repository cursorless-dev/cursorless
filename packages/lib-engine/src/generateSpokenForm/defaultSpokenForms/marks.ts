import {
  hatColorDefaultSpokenForms,
  hatShapeDefaultSpokenForms,
} from "@cursorless/lib-common";

export function hatColorToSpokenForm(color: string): string {
  const result = hatColorDefaultSpokenForms[color];
  if (result == null) {
    throw new Error(`Unknown hat color '${color}'`);
  }
  return result;
}

export function hatShapeToSpokenForm(shape: string): string {
  const result = hatShapeDefaultSpokenForms[shape];
  if (result == null) {
    throw new Error(`Unknown hat shape '${shape}'`);
  }
  return result;
}
