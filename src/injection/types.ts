export interface Type<T> {
  new (...args: any[]): T;
}

export type TypeClass<T = any> = {
  type: "transient" | "singleton";
  cls: Type<T>;
  params: Type<T>[];
};

export type TypeValue = {
  type: "value";
  value: any;
};

export type TypeInfo = TypeClass | TypeValue;
