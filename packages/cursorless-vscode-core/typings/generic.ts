// From https://fettblog.eu/typescript-better-object-keys/
type ObjectKeys<T> = T extends object
  ? (keyof T)[]
  : T extends number
  ? []
  : T extends Array<any> | string
  ? string[]
  : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ObjectConstructor {
  keys<T>(o: T): ObjectKeys<T>;
}
