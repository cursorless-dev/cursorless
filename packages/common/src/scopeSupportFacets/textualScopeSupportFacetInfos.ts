import {
  ScopeSupportFacetInfo,
  TextualScopeSupportFacet,
} from "./scopeSupportFacets.types";

export const textualScopeSupportFacetInfos: Record<
  TextualScopeSupportFacet,
  ScopeSupportFacetInfo
> = {
  character: {
    label: "Character",
    description: "A single character in the document",
    scopeType: "character",
    examples: ["a", "."],
  },
  word: {
    label: "Word",
    description: "A single word in a token",
    scopeType: "word",
    examples: ["foo_bar", "fooBar"],
  },
  token: {
    label: "Token",
    description: "A single token in the document",
    scopeType: "token",
    examples: ["foo", "("],
  },
  line: {
    label: "Line",
    description: "A single line in the document",
    scopeType: "line",
    examples: ["foo"],
  },
  paragraph: {
    label: "Paragraph",
    description:
      "A single paragraph(contiguous block of lines) in the document",
    scopeType: "paragraph",
    examples: ["foo\nbar"],
  },
  document: {
    label: "Documents",
    description: "The entire document",
    scopeType: "document",
    examples: ["foo\n\nbar"],
  },
};
