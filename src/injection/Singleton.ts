import "reflect-metadata";
import container from "./Container";
import { Type } from "./types";

export default function () {
  return function <T>(target: Type<T>) {
    container.registerSingleton(target);
  };
}
