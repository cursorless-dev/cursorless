import type { SpokenFormReference } from "./ReferenceEntry";

export function getSpokenForm(reference: SpokenFormReference): string {
  if (reference.defaultSpokenForm == null) {
    throw new Error("Reference has no default spoken form");
  }

  return reference.defaultSpokenForm;
}
