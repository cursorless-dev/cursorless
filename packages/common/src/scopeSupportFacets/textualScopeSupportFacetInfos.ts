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
  identifier: {
    description: "A single alphanumeric identifier in the document",
    scopeType: "identifier",
  },
  line: {
    description: "A single line in the document",
    scopeType: "line",
  },
  sentence: {
    description: "A single sentence in the document",
    scopeType: "sentence",
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
  nonWhitespaceSequence: {
    description: "A sequence of non-whitespace characters",
    scopeType: "nonWhitespaceSequence",
  },
  url: {
    description: "A url",
    scopeType: "url",
  },
  surroundingPair: {
    description: "A pair of surrounding delimiters",
    scopeType: {
      type: "surroundingPair",
      delimiter: "any",
    },
  },
  "surroundingPair.iteration": {
    description: "A pair of surrounding delimiters",
    scopeType: {
      type: "surroundingPair",
      delimiter: "any",
    },
    isIteration: true,
  },
  // FIXME: Still in legacy
  // boundedNonWhitespaceSequence: {
  //   description:
  //     "A sequence of non-whitespace characters bounded by matching pair",
  //   scopeType: "boundedNonWhitespaceSequence",
  // },
};
