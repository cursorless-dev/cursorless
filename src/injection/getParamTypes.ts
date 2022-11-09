import { Type } from "./types";

export default function <T>(cls: Type<T>): any[] {
  return Reflect.getMetadata("design:paramtypes", cls) ?? [];
}
