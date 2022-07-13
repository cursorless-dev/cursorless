import ModifyIfWeakStage from "./ModifyIfWeakStage";

export const weakContainingSurroundingPairStage = new ModifyIfWeakStage({
  type: "modifyIfWeak",
  modifier: {
    type: "containingScope",
    scopeType: { type: "surroundingPair", delimiter: "any" },
  },
});

export const weakContainingLineStage = new ModifyIfWeakStage({
  type: "modifyIfWeak",
  modifier: {
    type: "containingScope",
    scopeType: { type: "line" },
  },
});

export const weakContainingTokenStage = new ModifyIfWeakStage({
  type: "modifyIfWeak",
  modifier: {
    type: "containingScope",
    scopeType: { type: "token" },
  },
});
