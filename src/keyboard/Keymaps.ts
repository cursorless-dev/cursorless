import { ActionType } from "../actions/actions.types";
import { HatColor } from "../core/hatStyles";
import { SimpleScopeTypeType } from "../typings/targetDescriptor.types";

type ActionCommand = `actions.${ActionType}`;
type ScopeCommand = `scopes.${SimpleScopeTypeType}`;
type ColorCommand = `colors.${HatColor}`;
type Command = ActionCommand | ScopeCommand | ColorCommand;

export const topLevelKeys: Record<string, Command> = {
  d: "colors.default",
  f: "scopes.namedFunction",
  c: "actions.remove",
};
