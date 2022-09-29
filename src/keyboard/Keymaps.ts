import { ActionType } from "../actions/actions.types";
import { HatColor } from "../core/hatStyles";
import { SimpleScopeTypeType } from "../typings/targetDescriptor.types";

export type KeyMap<T> = Record<string, T>;

export const actionKeymap: KeyMap<ActionType> = {
  c: "remove",
};

export const scopeKeymap: KeyMap<SimpleScopeTypeType> = {
  f: "namedFunction",
};

export const colorKeymap: KeyMap<HatColor> = {
  d: "default",
};
