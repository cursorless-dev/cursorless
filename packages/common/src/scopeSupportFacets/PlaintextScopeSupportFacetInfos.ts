import type {
  ScopeSupportFacetInfo,
  PlaintextScopeSupportFacet,
} from "./scopeSupportFacets.types";

export const plaintextScopeSupportFacetInfos: Record<
  PlaintextScopeSupportFacet,
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
  boundedParagraph: {
    description:
      "A single paragraph(contiguous block of lines) in the document bounded by matching pair",
    scopeType: "boundedParagraph",
  },
  "boundedParagraph.iteration": {
    description: "Iteration scope for bounded paragraph",
    scopeType: "boundedParagraph",
    isIteration: true,
  },
  document: {
    description: "The entire document",
    scopeType: "document",
  },
  nonWhitespaceSequence: {
    description: "A sequence of non-whitespace characters",
    scopeType: "nonWhitespaceSequence",
  },
  boundedNonWhitespaceSequence: {
    description:
      "A sequence of non-whitespace characters bounded by matching pair",
    scopeType: "boundedNonWhitespaceSequence",
  },
  "boundedNonWhitespaceSequence.iteration": {
    description: "Iteration scope for bounded non-whitespace sequence",
    scopeType: "boundedNonWhitespaceSequence",
    isIteration: true,
  },
  url: {
    description: "A url",
    scopeType: "url",
  },
  surroundingPair: {
    description: "A delimiter pair, such as parentheses or quotes",
    scopeType: {
      type: "surroundingPair",
      delimiter: "any",
    },
  },
  "surroundingPair.iteration": {
    description: "The iteration scope for delimiter pairs",
    scopeType: {
      type: "surroundingPair",
      delimiter: "any",
    },
    isIteration: true,
  },
  "interior.surroundingPair": {
    description: "The interior scope of a surrounding pair",
    scopeType: {
      type: "interior",
    },
  },
  "collectionItem.textual": {
    description: "A text based collection item",
    scopeType: {
      type: "collectionItem",
    },
  },
  "collectionItem.textual.iteration": {
    description: "Iteration scope for text based collection items",
    scopeType: {
      type: "collectionItem",
    },
    isIteration: true,
  },
};
