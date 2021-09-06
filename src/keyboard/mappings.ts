import { ActionType, PartialPrimitiveTarget } from "../typings/Types";

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]> | undefined;
};

type CompoundTransition = "startRange" | "toggleList";

type KeyboardContextName = "target" | "character";

type Mapping = {
  nextContext: KeyboardContextName;
  action?: ActionType;
  target?: RecursivePartial<PartialPrimitiveTarget>;
  compoundTransition?: CompoundTransition;
};

const topLevelTargetMapping: Record<string, Mapping> = {
  a: {},
  b: {},
  c: {},
  d: {
    nextContext: "character",
    target: { mark: { type: "decoratedSymbol", symbolColor: "default" } },
  },
  e: {},
  f: {},
  g: {},
  h: {},
  i: {},
  j: {},
  k: {},
  l: {
    nextContext: "target",
    compoundTransition: "toggleList",
  },
  m: {},
  n: {},
  o: {},
  p: {},
  q: {},
  r: {
    nextContext: "target",
    compoundTransition: "startRange",
  },
  s: {},
  t: {},
  u: {},
  v: {},
  w: {},
  x: {},
  y: {},
  z: {},
};

const topLevelActionMapping: Record<string, Mapping> = {
  a: {},
  b: {},
  c: {},
  d: {},
  e: {},
  f: {},
  g: {},
  h: {},
  i: {},
  j: {},
  k: {},
  l: {},
  m: {},
  n: {},
  o: {},
  p: {},
  q: {},
  r: {},
  s: {},
  t: {
    nextContext: "target",
    action: "setSelection",
  },
  u: {},
  v: {},
  w: {},
  x: {},
  y: {},
  z: {},
};

// default color => `characterContext`
// green => `characterContext`
// red => `characterContext`
