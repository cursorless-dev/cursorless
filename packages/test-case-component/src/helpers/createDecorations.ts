import type {
    Command,
    CommandLatest,
    PlainSpyIDERecordedValues,
    SelectionPlainObject,
    SerializedMarks,
    TargetPlainObject,
} from "@cursorless/common";
import type { DecorationItem } from "shiki"
import { getMarkDecorations } from "./getMarkDecorations";
import { getIdeFlashDecorations } from "./getIdeFlashDecorations";
import { getSlections } from "./getSelections";
import { getSourceMarks } from "./getSourceMarks";
import { getThatMarks } from "./getThatMarks";

export function createDecorations(
    options: {
        marks?: SerializedMarks;
        command?: CommandLatest | Command;
        ide?: PlainSpyIDERecordedValues;
        lines?: string[]
        selections?: SelectionPlainObject[]
        thatMark?: TargetPlainObject[]
        sourceMark?: TargetPlainObject[]
        finalStateMarkHelpers?: {
            sourceMark?: TargetPlainObject[]
            thatMark?: TargetPlainObject[]
        }
    } = {}
): DecorationItem[][] {
    const { marks, ide, lines, selections, thatMark, sourceMark } = options

    const decorations: DecorationItem[][] = [];

    const markDecorations = getMarkDecorations({ marks, lines })
    const ideFlashDecorations = getIdeFlashDecorations({ lines, ide })
    const selectionRanges = getSlections({ selections })
    const sourceMarks_ = getSourceMarks({ sourceMark })

    decorations.push(markDecorations);
    decorations.push(ideFlashDecorations);
    decorations.push(selectionRanges);
    decorations.push(sourceMarks_);

    if (thatMark) {
        const thatMarks = getThatMarks({ thatMark })
        decorations.push(thatMarks);
    } else {
        decorations.push([])
    }

    return decorations
}

