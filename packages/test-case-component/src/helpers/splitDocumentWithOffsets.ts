/**
 * Splits a string into an array of objects containing the line content
 * and the cumulative offset from the start of the string.
 *
 * @param {string} documentContents - The string to split into lines.
 * @returns {{ line: string, offset: number }[]} An array of objects with line content and cumulative offset.
 */
function splitDocumentWithOffsets(documentContents: string): { line: string; offset: number }[] {
    const lines = documentContents.split("\n");
    let cumulativeOffset = 0;

    return lines.map((line) => {
        const result = { line, offset: cumulativeOffset };
        cumulativeOffset += line.length + 1; // +1 for the newline character
        return result;
    });
}

export { splitDocumentWithOffsets }
