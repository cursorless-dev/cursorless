import ModifyIfWeakStage from "./ModifyIfWeakStage";

export const weakContainingSurroundingPairStage = new ModifyIfWeakStage({
  type: "containingScope",
  scopeType: { type: "surroundingPair", delimiter: "any" },
});

export const weakContainingLineStage = new ModifyIfWeakStage({
  type: "containingScope",
  scopeType: { type: "line" },
});
