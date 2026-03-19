export interface Placeholder {
  type: "placeholder";
  index: number;
}

/**
 * This type recursively adds union with `Placeholder` to all fields of
 * {@link input}.
 */
export type WithPlaceholders<T> = T extends object
  ? T extends any[]
    ?
        | {
            [K in keyof T]: WithPlaceholders<T[K]>;
          }
        | Placeholder
    :
        | {
            [K in keyof T]: WithPlaceholders<T[K]>;
          }
        | Placeholder
  : T | Placeholder;
