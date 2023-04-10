import { ModifyIfUntypedStage } from "./ConditionalModifierStages";
// NB: We import `Target` below just so that @link below resolves.  Once one of
// the following issues are fixed, we can either remove the above line or
// switch to `{import("foo")}` syntax in the `{@link}` tag.
// - https://github.com/microsoft/TypeScript/issues/43869
// - https://github.com/microsoft/TypeScript/issues/43950
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import type { Target } from "../../typings/target.types";

/**
 * Expands the given target to the nearest containing surrounding pair if the
 * target has no explicit scope type, ie if {@link Target.hasExplicitScopeType}
 * is `false`.
 */
export const containingSurroundingPairIfUntypedStage = new ModifyIfUntypedStage({
  type: "modifyIfUntyped",
  modifier: {
    type: "containingScope",
    scopeType: { type: "surroundingPair", delimiter: "any" },
  },
});

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
