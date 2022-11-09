import "reflect-metadata";
import { typeInfos } from "./Container";
import getParamTypes from "./getParamTypes";
import { Type } from "./types";

export function transient() {
  return function <T>(cls: Type<T>) {
    typeInfos.set(cls, {
      type: "transient",
      cls,
      params: getParamTypes(cls),
    });
  };
}

export function singleton() {
  return function <T>(cls: Type<T>) {
    typeInfos.set(cls, {
      type: "singleton",
      cls,
      params: getParamTypes(cls),
    });
  };
}
