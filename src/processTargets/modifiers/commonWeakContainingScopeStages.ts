import WeakContainingScopeStage from "./WeakContainingScopeStage";

export const weakContainingSurroundingPairStage = new WeakContainingScopeStage({
  type: "containingScope",
  scopeType: { type: "surroundingPair", delimiter: "any" },
});

export const weakContainingLineStage = new WeakContainingScopeStage({
  type: "containingScope",
  scopeType: { type: "line" },
});
