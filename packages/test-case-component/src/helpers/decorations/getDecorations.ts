/**
 * Computes code decorations for a given test case state.
 *
 * @param {ExtendedTestCaseSnapshot} testCaseState - The test case state to decorate.
 * @param {Command} command - The command object for the test case.
 * @returns {Promise<DecorationItem[][]>} The computed decorations for the state.
 */
import type { ExtendedTestCaseSnapshot, StepNameType } from "../../types";
import type { Command } from "@cursorless/common";
import type { DecorationItem } from "shiki";
import { createDecorations } from "../index";

export async function getDecorations({
    snapshot,
    command
}: {
    snapshot: ExtendedTestCaseSnapshot;
    command: Command;
}): Promise<DecorationItem[][]> {
    const { messages, flashes, highlights, finalStateMarkHelpers } = snapshot;
    const potentialMarks = snapshot.marks || {};
    const lines = snapshot.documentContents.split("\n");
    // Use StepNameType for stepName, and provide a fallback if undefined
    const stepName: StepNameType = snapshot.stepName ?? "error";
    const obj = {
        marks: potentialMarks,
        ide: { messages, flashes, highlights },
        command,
        lines,
        selections: snapshot.selections,
        thatMark: snapshot.thatMark,
        sourceMark: snapshot.sourceMark,
        stepName,
    };
    const decorations = createDecorations(obj);
    return decorations;
}
