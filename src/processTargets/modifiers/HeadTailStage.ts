import { Range, TextEditor } from "vscode";
import { Target } from "../../typings/target.types";
import {
  HeadTailModifier,
  Modifier,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getModifierStage from "../getModifierStage";
import { ModifierStage } from "../PipelineStages.types";
import { processModifierStages } from "../processTargets";
import PlainTarget from "../targets/PlainTarget";

abstract class HeadTailStage implements ModifierStage {
  constructor(private isReversed: boolean, private modifiers?: Modifier[]) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    const modifiers = this.modifiers ?? [
      {
        type: "containingScope",
        scopeType: { type: "line" },
      },
    ];

    const modifierStages = modifiers.map(getModifierStage).reverse();
    const previousTargets = processModifierStages(context, modifierStages, [
      target,
    ]);

    return previousTargets.map((previousTarget) => {
      const contentRange = this.update(
        target.editor,
        target.contentRange,
        previousTarget.contentRange
      );
      return new PlainTarget({
        editor: target.editor,
        isReversed: this.isReversed,
        contentRange,
      });
    });
  }

  protected abstract update(
    editor: TextEditor,
    previousRange: Range,
    nextRange: Range
  ): Range;
}

export class HeadStage extends HeadTailStage {
  constructor(modifier: HeadTailModifier) {
    super(true, modifier.modifiers);
  }

  protected update(editor: TextEditor, previousRange: Range, nextRange: Range) {
    return new Range(nextRange.start, previousRange.end);
  }
}

export class TailStage extends HeadTailStage {
  constructor(modifier: HeadTailModifier) {
    super(false, modifier.modifiers);
  }

  protected update(editor: TextEditor, previousRange: Range, nextRange: Range) {
    return new Range(previousRange.start, nextRange.end);
  }
}
