import ModifyIfImplicitScopeTypeStage from "./ModifyIfImplicitScopeTypeStage";

export const implicitScopeTypeContainingSurroundingPairStage =
  new ModifyIfImplicitScopeTypeStage({
    type: "modifyIfImplicitScopeType",
    modifier: {
      type: "containingScope",
      scopeType: { type: "surroundingPair", delimiter: "any" },
    },
  });

export const implicitScopeTypeContainingLineStage =
  new ModifyIfImplicitScopeTypeStage({
    type: "modifyIfImplicitScopeType",
    modifier: {
      type: "containingScope",
      scopeType: { type: "line" },
    },
  });

export const implicitScopeTypeContainingTokenStage =
  new ModifyIfImplicitScopeTypeStage({
    type: "modifyIfImplicitScopeType",
    modifier: {
      type: "containingScope",
      scopeType: { type: "token" },
    },
  });
