import { matchAll, Range, type LiteralMark } from "@cursorless/common";
import { ide } from "../../singletons/ide.singleton";
import { Target } from "../../typings/target.types";
import { MarkStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";
import escapeRegExp from "lodash-es/escapeRegExp";

export class LiteralMarkStage implements MarkStage {
  constructor(private mark: LiteralMark) {}

  run(): Target[] {
    const editor = ide().activeTextEditor;

    if (editor == null) {
      return [];
    }

    const { document } = editor;
    const regex = constructFuzzyRegex(this.mark.text);
    console.log(regex);

    const cursorOffsets = editor.selections.flatMap((selection) =>
      selection.isEmpty
        ? [document.offsetAt(selection.active)]
        : [
            document.offsetAt(selection.anchor),
            document.offsetAt(selection.active),
          ],
    );

    const matches = editor.visibleRanges.flatMap((range) => {
      const rangeOffset = document.offsetAt(range.start);
      const text = document.getText(range);
      return matchAll(text, regex, (match) => {
        const matchedText = match[0];
        const startOffset = rangeOffset + match.index!;
        const endOffset = startOffset + matchedText.length;
        const distance = cursorOffsets.reduce(
          (acc, offset) =>
            Math.min(
              acc,
              Math.abs(offset - startOffset),
              Math.abs(offset - endOffset),
            ),
          Infinity,
        );
        return { startOffset, endOffset, distance };
      });
    });

    if (matches.length === 0) {
      throw Error(`No matches found for ${this.mark.text}`);
    }

    matches.sort((a, b) => {
      // First sort by distance to cursor
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      // Then sort by document order
      return a.startOffset - b.startOffset;
    });

    const contentRange = new Range(
      document.positionAt(matches[0].startOffset),
      document.positionAt(matches[0].endOffset),
    );
    return [
      new UntypedTarget({
        editor,
        contentRange,
        isReversed: false,
        hasExplicitRange: false,
      }),
    ];
  }
}

export function constructFuzzyRegex(text: string): RegExp {
  const parts = text.split(" ");
  // Between each word there can be nothing(camelCase) or a non character symbol.
  // Escape characters. eg: \t\n\r, are also acceptable.
  const pattern = parts.map(escapeRegExp).join("([^a-zA-Z]|\\\\[a-z])*");
  return new RegExp(pattern, "gi");
}
