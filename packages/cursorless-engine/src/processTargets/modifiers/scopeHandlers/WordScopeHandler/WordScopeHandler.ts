import { Range, TextEditor } from "@cursorless/common";
import { NestedScopeHandler } from "../NestedScopeHandler";
import { WordTokenizer } from "./WordTokenizer";
import { Direction } from "@cursorless/common";
import { SubTokenWordTarget } from "../../../targets";
import type { TargetScope } from "../scope.types";

export class WordScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "word" } as const;
  public readonly iterationScopeType = { type: "identifier" } as const;

  private wordTokenizer = new WordTokenizer(this.languageId);

  private async getScopesInSearchScope({
    editor,
    domain,
  }: TargetScope): Promise<TargetScope[]> {
    const { document } = editor;
    // FIXME: Switch to using getMatchesInRange once we are able to properly
    // mock away vscode for the unit tests in subtoken.test.ts
    const offset = document.offsetAt(domain.start);
    const matches = this.wordTokenizer.splitIdentifier(
      await document.getText(domain),
    );
    const contentRanges = matches.map(
      (match) =>
        new Range(
          document.positionAt(offset + match.index),
          document.positionAt(offset + match.index + match.text.length),
        ),
    );

    return contentRanges.map((range, i) => ({
      editor,
      domain: range,
      getTargets: (isReversed) => {
        const previousContentRange = i > 0 ? contentRanges[i - 1] : null;
        const nextContentRange =
          i + 1 < contentRanges.length ? contentRanges[i + 1] : null;

        return [
          constructTarget(
            isReversed,
            editor,
            previousContentRange,
            range,
            nextContentRange,
          ),
        ];
      },
    }));
  }

  protected async generateScopesInSearchScope(
    direction: Direction,
    searchScope: TargetScope,
  ): Promise<Iterable<TargetScope>> {
    const scopes = this.getScopesInSearchScope(searchScope);

    if (direction === "backward") {
      (await scopes).reverse();
    }

    return scopes;
  }
}

async function constructTarget(
  isReversed: boolean,
  editor: TextEditor,
  previousContentRange: Range | null,
  contentRange: Range,
  nextContentRange: Range | null,
) {
  const leadingDelimiterRange =
    previousContentRange != null &&
    contentRange.start.isAfter(previousContentRange.end)
      ? new Range(previousContentRange.end, contentRange.start)
      : undefined;

  const trailingDelimiterRange =
    nextContentRange != null && nextContentRange.start.isAfter(contentRange.end)
      ? new Range(contentRange.end, nextContentRange.start)
      : undefined;

  const isInDelimitedList =
    leadingDelimiterRange != null || trailingDelimiterRange != null;
  const insertionDelimiter = isInDelimitedList
    ? await editor.document.getText(
        (leadingDelimiterRange ?? trailingDelimiterRange)!,
      )
    : "";

  return new SubTokenWordTarget({
    editor,
    isReversed,
    contentRange,
    insertionDelimiter,
    leadingDelimiterRange,
    trailingDelimiterRange,
  });
}
