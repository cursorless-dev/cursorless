import {
  FlashStyle,
  GeneralizedRangePlainObject,
  PositionPlainObject,
  TestCaseFixture,
  TestCaseFixtureLegacy,
} from "@cursorless/common";
import { groupBy, partition } from "lodash";
import { reorderFields } from "./transformations/reorderFields";
import { FixtureTransformation } from "./types";

interface PlainTestDecoration {
  name: string;
  type: "token" | "line";
  start: PositionPlainObject;
  end: PositionPlainObject;
}

interface LegacyTestFixture extends TestCaseFixtureLegacy {
  /**
   * Expected decorations in the test case, for example highlighting deletions in red.
   */
  decorations?: PlainTestDecoration[];
}

// FIXME: Remove this before merging the PR
export const upgradeDecorations: FixtureTransformation = (
  fixture: LegacyTestFixture,
) => {
  if (fixture.decorations == null) {
    return fixture;
  }

  const { decorations } = fixture;
  const [highlights, flashes] = partition(
    decorations,
    ({ name }) =>
      name === "highlight0Background" || name === "highlight1Background",
  );

  fixture.decorations = undefined;

  fixture.ide = {
    ...(fixture.ide ?? {
      messages: undefined,
      flashes: undefined,
      highlights: undefined,
    }),
    highlights:
      highlights.length === 0
        ? undefined
        : Object.entries(groupBy(highlights, "name")).map(
            ([name, highlights]) => ({
              highlightId: extractHighlightName(name),
              ranges: highlights.map(extractHighlightRange),
            }),
          ),
    flashes:
      flashes.length === 0
        ? undefined
        : flashes.map((flash) => ({
            range: extractHighlightRange(flash),
            style: extractHighlightName(flash.name) as keyof typeof FlashStyle,
          })),
    scopeVisualizations: undefined,
  };

  return reorderFields(fixture as TestCaseFixture);
};

function extractHighlightName(name: string): string {
  return name.replace("Background", "");
}

function extractHighlightRange(
  highlight: PlainTestDecoration,
): GeneralizedRangePlainObject {
  return highlight.type === "token"
    ? {
        type: "character",
        start: highlight.start,
        end: highlight.end,
      }
    : {
        type: "line",
        start: highlight.start.line,
        end: highlight.end.line,
      };
}
