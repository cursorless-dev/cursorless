/**
 * Computes code decorations for a given test case state.
 *
 * @param {ExtendedTestCaseSnapshot} testCaseState - The test case state to decorate.
 * @param {Command} command - The command object for the test case.
 * @returns {Promise<DecorationItem[][]>} The computed decorations for the state.
 */
import type { ExtendedTestCaseSnapshot } from "../../types";
import type { Command } from "@cursorless/common";
import type { DecorationItem } from "shiki";
import { createDecorations } from "../index";

export async function getDecorations(
    testCaseState: ExtendedTestCaseSnapshot,
    command: Command
): Promise<DecorationItem[][]> {
    const { messages, flashes, highlights, finalStateMarkHelpers } = testCaseState;
    const potentialMarks = testCaseState.marks || {};
    const lines = testCaseState.documentContents.split("\n");
    const obj = {
        marks: potentialMarks,
        ide: { messages, flashes, highlights },
        command,
        lines,
        selections: testCaseState.selections,
        thatMark: testCaseState.thatMark,
        sourceMark: testCaseState.sourceMark,
        finalStateMarkHelpers
    };
    const decorations = createDecorations(obj);
    return decorations;
}
