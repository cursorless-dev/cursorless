import { ScopeType } from "../typings/targetDescriptor.types";
import { ScopeHandler } from "./modifiers/scopeHandlers/scopeHandler.types";
import TokenScopeHandler from "./modifiers/scopeHandlers/TokenScopeHandler";

export default (scopeType: ScopeType): ScopeHandler => {
  switch (scopeType.type) {
    case "token":
      return new TokenScopeHandler(scopeType);
    default:
      throw Error(`Unknown scope handler ${scopeType.type}`);
  }
};
