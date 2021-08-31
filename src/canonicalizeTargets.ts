import { PartialTarget, ScopeType } from "./typings/Types";
import update from "immutability-helper";
import { transformPrimitiveTargets } from "./util/targetUtils";

const scopeTypeAliasToCanonicalName: Record<string, ScopeType> = {
  arrowFunction: "anonymousFunction",
  dictionary: "map",
  regex: "regularExpression",
};

export default function canonicalizeTargets(partialTargets: PartialTarget[]) {
  return transformPrimitiveTargets(partialTargets, (target) =>
    target.modifier?.type === "containingScope"
      ? update(target, {
          modifier: {
            scopeType: (scopeType) =>
              scopeTypeAliasToCanonicalName[scopeType] ?? scopeType,
          },
        })
      : target
  );
}
