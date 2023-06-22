import { Disposable, GeneralizedRange } from "@cursorless/common";
import { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
import { RangeTypeColors } from "./RangeTypeColors";
import { VscodeFancyRangeHighlighter } from "./VscodeFancyRangeHighlighter";
import { blendRangeTypeColors } from "./blendRangeTypeColors";
import { isGeneralizedRangeEqual } from "./isGeneralizedRangeEqual";

interface RendererScope {
  domain: GeneralizedRange;
  nestedRanges: GeneralizedRange[];
}

export class VscodeScopeRenderer implements Disposable {
  private domainHighlighter: VscodeFancyRangeHighlighter;
  private nestedRangeHighlighter: VscodeFancyRangeHighlighter;
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
    const nestedRanges: GeneralizedRange[] = [];
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
      nestedRanges.push(...nestedRanges);
    }

    this.domainHighlighter.setRanges(editor, domainRanges);
    this.nestedRangeHighlighter.setRanges(editor, nestedRanges);
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
