import ModifyIfUntypedStage from "./ModifyIfImplicitScopeTypeStage";

export const containingSurroundingPairIfUntypedStage = new ModifyIfUntypedStage(
  {
    type: "modifyIfUntyped",
    modifier: {
      type: "containingScope",
      scopeType: { type: "surroundingPair", delimiter: "any" },
    },
  }
);

export const containingLineIfUntypedStage = new ModifyIfUntypedStage({
  type: "modifyIfUntyped",
  modifier: {
    type: "containingScope",
    scopeType: { type: "line" },
  },
});

export const containingTokenIfUntypedStage = new ModifyIfUntypedStage({
  type: "modifyIfUntyped",
  modifier: {
    type: "containingScope",
    scopeType: { type: "token" },
  },
});
