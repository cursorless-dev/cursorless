import type { Disposable, GeneralizedRange } from "@cursorless/common";
import { isGeneralizedRangeEqual } from "@cursorless/common";
import type { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
import type { RangeTypeColors } from "./RangeTypeColors";
import { VscodeFancyRangeHighlighter } from "./VscodeFancyRangeHighlighter";
import { blendRangeTypeColors } from "./blendRangeTypeColors";

export interface RendererScope {
  domain: GeneralizedRange;
  nestedRanges: GeneralizedRange[];
}

/**
 * Responsible for rendering scopes, as used by {@link VscodeScopeVisualizer}.
 * Includes a hack where we color blend domain and nested ranges that are
 * identical, to reduce load on VSCode renderer and to work around some
 * glitchiness.
 */
export class VscodeScopeRenderer implements Disposable {
  private domainHighlighter: VscodeFancyRangeHighlighter;
  private nestedRangeHighlighter: VscodeFancyRangeHighlighter;
  /**
   * A highlighter that blends domain and nested range colors when they have
   * identical ranges
   */
  private domainEqualsNestedHighlighter: VscodeFancyRangeHighlighter;

  constructor(
    domainColors: RangeTypeColors,
    nestedRangeColors: RangeTypeColors,
  ) {
    this.domainHighlighter = new VscodeFancyRangeHighlighter(domainColors);
    this.nestedRangeHighlighter = new VscodeFancyRangeHighlighter(
      nestedRangeColors,
    );
    this.domainEqualsNestedHighlighter = new VscodeFancyRangeHighlighter(
      blendRangeTypeColors(domainColors, nestedRangeColors),
    );
  }

  setScopes(editor: VscodeTextEditorImpl, scopes: RendererScope[]) {
    const domainRanges: GeneralizedRange[] = [];
    const allNestedRanges: GeneralizedRange[] = [];
    const domainEqualsNestedRanges: GeneralizedRange[] = [];

    for (const { domain, nestedRanges } of scopes) {
      if (
        nestedRanges.length === 1 &&
        isGeneralizedRangeEqual(nestedRanges[0], domain)
      ) {
        domainEqualsNestedRanges.push(domain);
        continue;
      }

      domainRanges.push(domain);
      allNestedRanges.push(...nestedRanges);
    }

    this.domainHighlighter.setRanges(editor, domainRanges);
    this.nestedRangeHighlighter.setRanges(editor, allNestedRanges);
    this.domainEqualsNestedHighlighter.setRanges(
      editor,
      domainEqualsNestedRanges,
    );
  }

  dispose(): void {
    this.domainHighlighter.dispose();
    this.nestedRangeHighlighter.dispose();
    this.domainEqualsNestedHighlighter.dispose();
  }
}
