type GetOptional<T> = {
  [K in keyof T as Pick<T, K> extends Required<Pick<T, K>> ? never : K]: T[K];
};

type GetRequired<T> = {
  [K in keyof T as Pick<T, K> extends Required<Pick<T, K>> ? K : never]: T[K];
};

type UnionUndefined<T> = {
  [K in keyof T]: T[K] | undefined;
};

/**
 * Use this type to convert all optional keys in an interface to required undefined unions.
 * Useful for passthrough objects that need manual extending
 * { opt?: boolean; } => { opt: boolean | undefined; }
 */
export type EnforceUndefined<T> = GetRequired<T> &
  UnionUndefined<Required<GetOptional<T>>>;
