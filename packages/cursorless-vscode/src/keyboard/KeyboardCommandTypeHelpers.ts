import { KeyboardCommandHandler } from "./KeyboardCommandHandler";

/**
 * Maps from the name of a method in KeyboardCommandHandler to the type of its
 * argument.
 */
export type KeyboardCommandArgTypes = {
  [K in keyof KeyboardCommandHandler]: KeyboardCommandHandler[K] extends (
    arg: infer T,
  ) => void
    ? T
    : never;
};

export type KeyboardCommandTypeMap = {
  [K in keyof KeyboardCommandHandler]: {
    type: K;
    arg: KeyboardCommandArgTypes[K];
  };
};

export type KeyboardCommand<T extends keyof KeyboardCommandHandler> = {
  type: T;
  arg: KeyboardCommandArgTypes[T];
};

// Ensure that all methods in KeyboardCommandHandler take an object as their
// first argument, and return void or Promise<void>. Note that the first check
// may look backwards, because the arg type is contravariant, so the 'extends'
// needs to be flipped.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertExtends<A extends B, B>() {}
assertExtends<
  Record<keyof KeyboardCommandArgTypes, (arg?: object) => never>,
  Pick<KeyboardCommandHandler, keyof KeyboardCommandArgTypes>
>;
assertExtends<
  Pick<KeyboardCommandHandler, keyof KeyboardCommandArgTypes>,
  Record<keyof KeyboardCommandArgTypes, (arg: never) => void | Promise<void>>
>;
