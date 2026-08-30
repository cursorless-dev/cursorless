import type {
  CheatsheetInfo,
  CheatsheetItem,
  CheatsheetVariation,
} from "./cheatsheet.types";

const captureRegex = /<[^>]+>/gu;

/**
 * Applies the spoken forms produced by the version-0 Talon cheatsheet payload
 * to the current cheatsheet structure and descriptions.
 */
export function applyLegacyCheatsheetInfo(
  current: CheatsheetInfo,
  legacy: CheatsheetInfo,
): CheatsheetInfo {
  const legacySections = new Map(
    legacy.sections.map((section) => [section.id, section]),
  );

  return {
    sections: current.sections.map((section) => {
      const legacySection = legacySections.get(section.id);
      if (legacySection == null) {
        return section;
      }

      const legacyItems = new Map(
        legacySection.items.map((item) => [item.id, item]),
      );

      return {
        ...section,
        items: section.items.flatMap((item) => {
          const legacyItem = legacyItems.get(
            getLegacyItemId(section.id, item.id),
          );
          return legacyItem == null ? [] : [applyLegacyItem(item, legacyItem)];
        }),
      };
    }),
  };
}

function getLegacyItemId(sectionId: string, itemId: string): string {
  return sectionId === "actions" && itemId === "rewrapWithPairedDelimiter"
    ? "rewrap"
    : itemId;
}

function applyLegacyItem(
  current: CheatsheetItem,
  legacy: CheatsheetItem,
): CheatsheetItem {
  const legacyBySignature = groupByCaptureSignature(legacy.variations);
  const signatureIndexes = new Map<string, number>();
  const replacements: Array<readonly [string, string]> = [];

  const matchedSpokenForms = current.variations.map((variation) => {
    const signature = captureSignature(variation);
    const signatureIndex = signatureIndexes.get(signature) ?? 0;
    signatureIndexes.set(signature, signatureIndex + 1);
    const legacyVariation = legacyBySignature.get(signature)?.[signatureIndex];

    if (legacyVariation != null) {
      collectLiteralReplacements(variation, legacyVariation, replacements);
    }

    return legacyVariation?.spokenForm;
  });

  return {
    ...current,
    variations: current.variations.map((variation, index) => ({
      ...variation,
      spokenForm:
        matchedSpokenForms[index] ??
        applyLiteralReplacements(variation.spokenForm, replacements),
    })),
  };
}

function groupByCaptureSignature(
  variations: readonly CheatsheetVariation[],
): Map<string, CheatsheetVariation[]> {
  const result = new Map<string, CheatsheetVariation[]>();
  for (const variation of variations) {
    const signature = captureSignature(variation);
    const entries = result.get(signature) ?? [];
    entries.push(variation);
    result.set(signature, entries);
  }

  return result;
}

function captureSignature({ spokenForm }: CheatsheetVariation): string {
  return Array.from(
    spokenForm.matchAll(captureRegex),
    ([capture]) => capture,
  ).join("\0");
}

function collectLiteralReplacements(
  current: CheatsheetVariation,
  legacy: CheatsheetVariation,
  replacements: Array<readonly [string, string]>,
) {
  const currentParts = current.spokenForm.split(captureRegex);
  const legacyParts = legacy.spokenForm.split(captureRegex);

  for (let index = 0; index < currentParts.length; index++) {
    const currentPart = currentParts[index]?.trim();
    const legacyPart = legacyParts[index]?.trim();
    if (
      currentPart != null &&
      legacyPart != null &&
      currentPart.length > 0 &&
      currentPart !== legacyPart
    ) {
      replacements.push([currentPart, legacyPart]);
    }
  }
}

function applyLiteralReplacements(
  spokenForm: string,
  replacements: readonly (readonly [string, string])[],
): string {
  let result = spokenForm;
  for (const [from, to] of replacements) {
    result = result.replace(from, to);
  }
  return result;
}
