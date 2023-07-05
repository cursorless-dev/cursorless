import {
  Disposable,
  GeneralizedRange,
  isGeneralizedRangeEqual,
} from "@cursorless/common";
import { Vscode } from "@cursorless/vscode-common";
import { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
import { RangeTypeColors } from "./RangeTypeColors";
import { VscodeFancyRangeHighlighter } from "./VscodeFancyRangeHighlighter";
import { blendRangeTypeColors } from "./blendRangeTypeColors";

export interface RendererScope {
  domain: GeneralizedRange;
  nestedRanges: GeneralizedRange[];
}

export class VscodeScopeRenderer implements Disposable {
  private domainHighlighter: VscodeFancyRangeHighlighter;
  private nestedRangeHighlighter: VscodeFancyRangeHighlighter;
  private domainEqualsNestedHighlighter: VscodeFancyRangeHighlighter;

  constructor(
    vscode: Vscode,
    domainColors: RangeTypeColors,
    nestedRangeColors: RangeTypeColors,
  ) {
    this.domainHighlighter = new VscodeFancyRangeHighlighter(
      vscode,
      domainColors,
    );
    this.nestedRangeHighlighter = new VscodeFancyRangeHighlighter(
      vscode,
      nestedRangeColors,
    );
    this.domainEqualsNestedHighlighter = new VscodeFancyRangeHighlighter(
      vscode,
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
