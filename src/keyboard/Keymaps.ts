import { ActionType } from "../actions/actions.types";
import { HatColor, HatShape } from "../core/hatStyles";
import { SimpleScopeTypeType } from "../typings/targetDescriptor.types";

export type Keymap<T> = Record<string, T>;

export const actionKeymap: Keymap<ActionType> = {};

export const scopeKeymap: Keymap<SimpleScopeTypeType> = {};

export const colorKeymap: Keymap<HatColor> = {};

export const shapeKeymap: Keymap<HatShape> = {};
