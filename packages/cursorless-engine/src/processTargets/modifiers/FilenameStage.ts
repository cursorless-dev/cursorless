import type { Target } from "../../typings/target.types";
import type {
  ModifierStage,
  ModifierStateOptions,
} from "../PipelineStages.types";
import { TextOnlyTarget } from "../targets/TextOnlyTarget";

/**
 * Produces a {@link TextOnlyTarget} with the document filename (optionally
 * without the extension) so that it can be inserted via normal actions.
 */
export class FilenameStage implements ModifierStage {
  constructor(private mode: "filename" | "filenameWithoutExtension") {}

  run(target: Target, _options: ModifierStateOptions): Target[] {
    return [
      new TextOnlyTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange: target.contentRange,
        text:
          this.mode === "filename"
            ? target.editor.document.filename
            : getBaseName(target.editor.document.filename),
        thatTarget: target,
      }),
    ];
  }
}

function getBaseName(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot === -1 ? filename : filename.slice(0, lastDot);
}
