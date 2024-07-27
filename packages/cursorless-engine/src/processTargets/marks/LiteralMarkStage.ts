import {
  matchAll,
  Range,
  type LiteralMark,
  type Position,
} from "@cursorless/common";
import escapeRegExp from "lodash-es/escapeRegExp";
import { ide } from "../../singletons/ide.singleton";
import { Target } from "../../typings/target.types";
import { MarkStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";

export class LiteralMarkStage implements MarkStage {
  constructor(private mark: LiteralMark) {}

  run(): Target[] {
    const editor = ide().activeTextEditor;

    if (editor == null) {
      return [];
    }

    const { document } = editor;
    const regex = constructFuzzyRegex(this.mark.text);

    const cursorPositions = editor.selections.flatMap(
      (selection) => selection.active,
    );

    const matches = editor.visibleRanges.flatMap((range) => {
      const rangeOffset = document.offsetAt(range.start);
      const text = document.getText(range);
      return matchAll(text, regex, (match) => {
        const start = document.positionAt(rangeOffset + match.index!);
        const end = document.positionAt(
          rangeOffset + match.index! + match[0].length,
        );

        const distance = cursorPositions.reduce(
          (acc, position) =>
            Math.min(
              acc,
              distanceBetweenPositions(position, start),
              distanceBetweenPositions(position, end),
            ),
          Infinity,
        );
        return { start, end, distance };
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
      return a.start.compareTo(b.start);
    });

    const contentRange = new Range(matches[0].start, matches[0].end);

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

function distanceBetweenPositions(a: Position, b: Position): number {
  return (
    Math.abs(a.line - b.line) * 10000 + Math.abs(a.character - b.character)
  );
}

export function constructFuzzyRegex(text: string): RegExp {
  const parts = text.split(" ");
  // Between each word there can be nothing(camelCase) or a non character symbol.
  // Escape characters. eg: \t\n\r, are also acceptable.
  const pattern = parts.map(escapeRegExp).join("([^a-zA-Z]|\\\\[a-z])*");
  return new RegExp(pattern, "gi");
}
