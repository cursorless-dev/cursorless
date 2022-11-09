import { Type } from "./types";

export default function <T>(cls: Type<T>): any[] {
  const params = Reflect.getMetadata("design:paramtypes", cls) ?? [];

  if (cls.length !== params.length) {
    throw Error(
      `Expected ${cls.length} parameters, but found ${params.length} for dependency '${cls.name}'`,
    );
  }

  return params;
}
