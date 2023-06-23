import { Position, Range, TextEditor } from "./types";
import {
  CharacterRange,
  GeneralizedRange,
  LineRange,
  generalizedRangeContains,
  generalizedRangeTouches,
  isGeneralizedRangeEqual,
  toCharacterRange,
  toLineRange,
} from "./GeneralizedRange";

describe("GeneralizedRange", () => {
  const editor: TextEditor = {
    document: {
      uri: "",
      fileName: "",
      isUntitled: false,
      getText: () => "",
      lineCount: 0,
      offsetAt: (pos: Position) => 0,
      positionAt: (offset: number) => new Position(0, 0),
      save: () => Promise.resolve(true),
      eol: 0,
    },
    selection: new Range(new Position(0, 0), new Position(0, 0)),
  };

  describe("toLineRange", () => {
    it("converts a range to a line range", () => {
      const range = new Range(new Position(1, 0), new Position(3, 5));
      const lineRange: LineRange = { type: "line", start: 1, end: 3 };
      expect(toLineRange(range)).toEqual(lineRange);
    });
  });

  describe("toCharacterRange", () => {
    it("converts a range to a character range", () => {
      const range = new Range(new Position(1, 0), new Position(3, 5));
      const charRange: CharacterRange = {
        type: "character",
        start: new Position(1, 0),
        end: new Position(3, 5),
      };
      expect(toCharacterRange(range)).toEqual(charRange);
    });
  });

  describe("generalizedRangeContains", () => {
    it("returns true if a contains b", () => {
      const a: GeneralizedRange = {
        type: "character",
        start: new Position(1, 0),
        end: new Position(3, 5),
      };
      const b: GeneralizedRange = {
        type: "character",
        start: new Position(2, 0),
        end: new Position(3, 0),
      };
      expect(generalizedRangeContains(a, b)).toBe(true);
    });

    it("returns false if a does not contain b", () => {
      const a: GeneralizedRange = {
        type: "character",
        start: new Position(1, 0),
        end: new Position(3, 5),
      };
      const b: GeneralizedRange = {
        type: "character",
        start: new Position(4, 0),
        end: new Position(5, 0),
      };
      expect(generalizedRangeContains(a, b)).toBe(false);
    });

    it("returns true if a contains b (line range)", () => {
      const a: GeneralizedRange = { type: "line", start: 1, end: 3 };
      const b: GeneralizedRange = {
        type: "character",
        start: new Position(2, 0),
        end: new Position(3, 0),
      };
      expect(generalizedRangeContains(a, b)).toBe(true);
    });

    it("returns false if a does not contain b (line range)", () => {
      const a: GeneralizedRange = { type: "line", start: 1, end: 3 };
      const b: GeneralizedRange = {
        type: "character",
        start: new Position(4, 0),
        end: new Position(5, 0),
      };
      expect(generalizedRangeContains(a, b)).toBe(false);
    });
  });

  describe("generalizedRangeTouches", () => {
    it("returns true if a touches b", () => {
      const a: GeneralizedRange = {
        type: "character",
        start: new Position(1, 0),
        end: new Position(3, 5),
      };
      const b: GeneralizedRange = {
        type: "character",
        start: new Position(3, 0),
        end: new Position(4, 0),
      };
      expect(generalizedRangeTouches(a, b)).toBe(true);
    });

    it("returns false if a does not touch b", () => {
      const a: GeneralizedRange = {
        type: "character",
        start: new Position(1, 0),
        end: new Position(3, 5),
      };
      const b: GeneralizedRange = {
        type: "character",
        start: new Position(4, 0),
        end: new Position(5, 0),
      };
      expect(generalizedRangeTouches(a, b)).toBe(false);
    });

    it("returns true if a touches b (line range)", () => {
      const a: GeneralizedRange = { type: "line", start: 1, end: 3 };
      const b: GeneralizedRange = {
        type: "character",
        start: new Position(3, 0),
        end: new Position(4, 0),
      };
      expect(generalizedRangeTouches(a, b)).toBe(true);
    });

    it("returns false if a does not touch b (line range)", () => {
      const a: GeneralizedRange = { type: "line", start: 1, end: 3 };
      const b: GeneralizedRange = {
        type: "character",
        start: new Position(4, 0),
        end: new Position(5, 0),
      };
      expect(generalizedRangeTouches(a, b)).toBe(false);
    });
  });

  describe("isGeneralizedRangeEqual", () => {
    it("returns true if a and b are equal (character range)", () => {
      const a: GeneralizedRange = {
        type: "character",
        start: new Position(1, 0),
        end: new Position(3, 5),
      };
      const b: GeneralizedRange = {
        type: "character",
        start: new Position(1, 0),
        end: new Position(3, 5),
      };
      expect(isGeneralizedRangeEqual(a, b)).toBe(true);
    });

    it("returns true if a and b are equal (line range)", () => {
      const a: GeneralizedRange = { type: "line", start: 1, end: 3 };
      const b: GeneralizedRange = { type: "line", start: 1, end: 3 };
      expect(isGeneralizedRangeEqual(a, b)).toBe(true);
    });

    it("returns false if a and b are not equal", () => {
      const a: GeneralizedRange = {
        type: "character",
        start: new Position(1, 0),
        end: new Position(3, 5),
      };
      const b: GeneralizedRange = {
        type: "character",
        start: new Position(1, 0),
        end: new Position(4, 0),
      };
      expect(isGeneralizedRangeEqual(a, b)).toBe(false);
    });
  });
});
