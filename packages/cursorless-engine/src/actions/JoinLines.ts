import type { Edit, TextEditor } from "@cursorless/common";
import { FlashStyle, Range, zipStrict } from "@cursorless/common";
import { range as iterRange, map, pairwise } from "itertools";
import { flatten } from "lodash-es";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { containingLineIfUntypedModifier } from "../processTargets/modifiers/commonContainingScopeIfUntypedModifiers";
import type { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import type { ModifierStage } from "../processTargets/PipelineStages.types";
import { ide } from "../singletons/ide.singleton";
import { getMatcher } from "../tokenizer";
import type { Target } from "../typings/target.types";
import { generateMatchesInRange } from "../util/getMatchesInRange";
import { flashTargets, runOnTargetsForEachEditor } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export default class JoinLines {
  getFinalStages(): ModifierStage[] {
    return [this.modifierStageFactory.create(containingLineIfUntypedModifier)];
  }

  constructor(
    private rangeUpdater: RangeUpdater,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    await flashTargets(
      ide(),
      targets.map(({ thatTarget }) => thatTarget),
      FlashStyle.pendingModification0,
    );

    const thatSelections = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const { thatRanges: updatedThatRanges } =
          await performEditsAndUpdateSelections({
            rangeUpdater: this.rangeUpdater,
            editor: ide().getEditableTextEditor(editor),
            edits: getEdits(editor, targets),
            selections: {
              thatRanges: targets.map(({ contentRange }) => contentRange),
            },
          });

        return zipStrict(targets, updatedThatRanges).map(([target, range]) => ({
          editor,
          selection: range.toSelection(target.isReversed),
        }));
      }),
    );

    return { thatSelections };
  }
}

function getEdits(editor: TextEditor, targets: Target[]): Edit[] {
  const edits: Edit[] = [];

  for (const target of targets) {
    const targetsEdits =
      target.joinAs === "line"
        ? getLineTargetEdits(target)
        : getTokenTargetEdits(target);

    edits.push(...targetsEdits);
  }

  return edits;
}

function getTokenTargetEdits(target: Target): Edit[] {
  const { editor, contentRange } = target;
  const regex = getMatcher(editor.document.languageId).tokenMatcher;
  const matches = generateMatchesInRange(
    regex,
    editor,
    contentRange,
    "forward",
  );

  return Array.from(pairwise(matches)).map(
    ([range1, range2]): Edit => ({
      range: new Range(range1.end, range2.start),
      text: "",
      isReplace: true,
    }),
  );
}

function getLineTargetEdits(target: Target): Edit[] {
  const { document } = target.editor;
  const range = target.contentRange;
  const startLine = range.start.line;
  const endLine = range.isSingleLine
    ? Math.min(startLine + 1, document.lineCount - 1)
    : range.end.line;

  const lines = map(iterRange(startLine, endLine + 1), (i) =>
    document.lineAt(i),
  );

  return Array.from(pairwise(lines)).map(
    ([line1, line2]): Edit => ({
      range: new Range(
        line1.rangeTrimmed?.end ?? line1.range.end,
        line2.rangeTrimmed?.start ?? line2.range.start,
      ),
      text: line2.isEmptyOrWhitespace ? "" : " ",
      isReplace: true,
    }),
  );
}
