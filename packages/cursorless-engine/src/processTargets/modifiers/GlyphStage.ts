import { GlyphModifier, Range } from "@cursorless/common";
import { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import { ModifierStage } from "../PipelineStages.types";
import { PlainTarget } from "../targets";

export class GlyphStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: GlyphModifier,
  ) {}

  run(target: Target): Target[] {
    const { editor, contentRange, isReversed } = target;

    const text = (() => {
      if (contentRange.isEmpty) {
        const line = editor.document.lineAt(contentRange.start);
        return editor.document.getText(
          new Range(contentRange.start, line.range.end),
        );
      }
      return target.contentText;
    })();

    const index = text.indexOf(this.modifier.glyph);

    if (index === -1) {
      throw new GlyphNotFoundError(this.modifier.glyph);
    }

    const offset = editor.document.offsetAt(contentRange.start);
    const start = editor.document.positionAt(offset + index);
    const end = editor.document.positionAt(
      offset + index + this.modifier.glyph.length,
    );

    return [
      new PlainTarget({
        editor,
        contentRange: new Range(start, end),
        isReversed,
      }),
    ];
  }
}

export class GlyphNotFoundError extends Error {
  constructor(glyph: string) {
    super(`Couldn't find glyph '${glyph}'.`);
    this.name = "GlyphNotFoundError";
  }
}
