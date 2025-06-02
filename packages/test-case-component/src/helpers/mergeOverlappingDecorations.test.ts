import { mergeOverlappingDecorations } from "./mergeOverlappingDecorations.ts";

describe("mergeOverlappingDecorations", () => {
    it("merges overlapping decorations and adds 'overlap' to class", () => {
        const input = [
            {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 1 },
                properties: { class: "hat default" },
                alwaysWrap: true,
            },
            {
                start: { line: 0, character: 1 },
                end: { line: 0, character: 1 },
                properties: { class: "selection" },
                alwaysWrap: true,
            },
        ];
        const result = mergeOverlappingDecorations(input);
        // Only the first decoration should be present, as there is no true overlap
        expect(result).toEqual([
            {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 1 },
                properties: { class: "hat default" },
                alwaysWrap: true,
            },
        ]);
    });

    it("returns non-overlapping decorations unchanged", () => {
        const input = [
            {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 1 },
                properties: { class: "hat default" },
            },
            {
                start: { line: 1, character: 0 },
                end: { line: 1, character: 1 },
                properties: { class: "selection" },
            },
        ];
        const result = mergeOverlappingDecorations(input);
        expect(result).toEqual([
            {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 1 },
                properties: { class: "hat default" },
                alwaysWrap: undefined,
            },
            {
                start: { line: 1, character: 0 },
                end: { line: 1, character: 1 },
                properties: { class: "selection" },
                alwaysWrap: undefined,
            },
        ]);
    });

    it("separates overlapping sections into their own items", () => {
        // item A: 1 to 4
        // item B: 2 to 5
        // returns three items: 1-2 (A), 2-4 (A+B+overlap), 4-5 (B)
        const input = [
            {
                start: { line: 0, character: 1 },
                end: { line: 0, character: 4 },
                properties: { class: "A" },
            },
            {
                start: { line: 0, character: 2 },
                end: { line: 0, character: 5 },
                properties: { class: "B" },
            },
        ];
        const result = mergeOverlappingDecorations(input);
        expect(result.length).toBe(3);
        expect(result[0]).toMatchObject({
            start: { line: 0, character: 1 },
            end: { line: 0, character: 2 },
            properties: { class: "A" },
        });
        // Defensive: ensure class is a string before splitting
        const classValue = result[1].properties?.class;
        const overlapClasses = typeof classValue === "string" ? classValue.split(" ") : [];
        expect(overlapClasses).toEqual(expect.arrayContaining(["A", "B", "overlap"]));
        expect(result[1].start).toEqual({ line: 0, character: 2 });
        expect(result[1].end).toEqual({ line: 0, character: 4 });
        expect(result[2]).toMatchObject({
            start: { line: 0, character: 4 },
            end: { line: 0, character: 5 },
            properties: { class: "B" },
        });
    });
});
