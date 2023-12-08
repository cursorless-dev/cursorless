import {
  ScopeSupportFacetInfo,
  TextualScopeSupportFacet,
} from "./scopeSupportFacets.types";

export const textualScopeSupportFacetInfos: Record<
  TextualScopeSupportFacet,
  ScopeSupportFacetInfo
> = {
  character: {
    description: "A single character in the document",
    scopeType: "character",
  },
  word: {
    description: "A single word in a token",
    scopeType: "word",
  },
  token: {
    description: "A single token in the document",
    scopeType: "token",
  },
  line: {
    description: "A single line in the document",
    scopeType: "line",
  },
  paragraph: {
    description:
      "A single paragraph(contiguous block of lines) in the document",
    scopeType: "paragraph",
  },
  document: {
    description: "The entire document",
    scopeType: "document",
  },
};
