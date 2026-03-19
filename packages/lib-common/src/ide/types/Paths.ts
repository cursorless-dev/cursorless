// From https://javascript.plainenglish.io/advanced-typescript-type-level-nested-object-paths-7f3d8901f29a

type Primitive = string | number | symbol;

type GenericObject = Record<Primitive, unknown>;

type Join<
  L extends Primitive | undefined,
  R extends Primitive | undefined,
> = L extends string | number
  ? R extends string | number
    ? `${L}.${R}`
    : L
  : R extends string | number
    ? R
    : undefined;

type Union<
  L extends unknown | undefined,
  R extends unknown | undefined,
> = L extends undefined
  ? R extends undefined
    ? undefined
    : R
  : R extends undefined
    ? L
    : L | R;

/**
 * Get all the possible paths of an object
 * @example
 * type Keys = Paths<{ a: { b: { c: string } }>
 * // 'a' | 'a.b' | 'a.b.c'
 */
export type Paths<
  T extends GenericObject,
  Prev extends Primitive | undefined = undefined,
  Path extends Primitive | undefined = undefined,
> = {
  [K in keyof T]: T[K] extends GenericObject
    ? Paths<T[K], Union<Prev, Path>, Join<Path, K>>
    : Union<Union<Prev, Path>, Join<Path, K>>;
}[keyof T];

/**
 * Get the type of the element specified by the path
 * @example
 * type TypeOfAB = GetFieldType<{ a: { b: { c: string } }, 'a.b'>
 * // { c: string }
 */
export type GetFieldType<
  T extends GenericObject,
  Path extends string, // Or, if you prefer, NestedPaths<T>
> = {
  [K in Path]: K extends keyof T
    ? T[K]
    : K extends `${infer P}.${infer S}`
      ? T[P] extends GenericObject
        ? GetFieldType<T[P], S>
        : never
      : never;
}[Path];
