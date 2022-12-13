import { ActionType } from "../actions/actions.types";
import { HatColor, HatShape } from "../core/hatStyles";
import isTesting from "../testUtil/isTesting";
import { SimpleScopeTypeType } from "../typings/targetDescriptor.types";

export type Keymap<T> = Record<string, T>;

// FIXME: Switch to a better mocking setup. We don't use our built in
// configuration set up because that is probably going to live server side, and
// the keyboard setup will probably live client side

export const DEFAULT_ACTION_KEYMAP: Keymap<ActionType> = isTesting()
  ? { t: "setSelection" }
  : {};

export const DEFAULT_SCOPE_KEYMAP: Keymap<SimpleScopeTypeType> = isTesting()
  ? { sf: "namedFunction" }
  : {};

export const DEFAULT_COLOR_KEYMAP: Keymap<HatColor> = isTesting()
  ? { d: "default" }
  : {};

export const DEFAULT_SHAPE_KEYMAP: Keymap<HatShape> = isTesting() ? {} : {};
