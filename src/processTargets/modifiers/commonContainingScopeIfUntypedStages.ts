import ModifyIfUntypedStage from "./ModifyIfUntypedStage";

/**
 * Expands the given target to the nearest containing surrounding pair if the
 * target has no explicit scope type, ie if {@link Target.hasExplicitScopeType}
 * is `false`.
 */
export const containingSurroundingPairIfUntypedStage = new ModifyIfUntypedStage(
  {
    type: "modifyIfUntyped",
    modifier: {
      type: "containingScope",
      scopeType: { type: "surroundingPair", delimiter: "any" },
    },
  }
);

/**
 * Expands the given target to the nearest containing line if the target has no
 * explicit scope type, ie if {@link Target.hasExplicitScopeType} is `false`.
 */
export const containingLineIfUntypedStage = new ModifyIfUntypedStage({
  type: "modifyIfUntyped",
  modifier: {
    type: "containingScope",
    scopeType: { type: "line" },
  },
});

/**
 * Expands the given target to the nearest containing token if the target has no
 * explicit scope type, ie if {@link Target.hasExplicitScopeType} is `false`.
 */
export const containingTokenIfUntypedStage = new ModifyIfUntypedStage({
  type: "modifyIfUntyped",
  modifier: {
    type: "containingScope",
    scopeType: { type: "token" },
  },
});
