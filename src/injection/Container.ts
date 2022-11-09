import getParamTypes from "./getParamTypes";
import { Type, TypeClass, TypeInfo } from "./types";

const typeInfos = new Map<Type<any>, TypeInfo>();
const singletons = new Map<Type<any>, any>();

class Container {
  registerTransient<T>(cls: Type<T>) {
    typeInfos.set(cls, {
      type: "transient",
      cls,
      params: getParamTypes(cls),
    });
  }

  registerSingleton<T>(cls: Type<T>) {
    typeInfos.set(cls, {
      type: "singleton",
      cls,
      params: getParamTypes(cls),
    });
  }

  registerValue<T>(cls: Type<T>, value: T) {
    typeInfos.set(cls, {
      type: "value",
      value,
    });
  }

  resolve<T>(cls: Type<T>): T {
    const typeInfo = typeInfos.get(cls);

    // Not registered
    if (typeInfo == null) {
      throw Error(`Can't resolve unregistered dependency '${cls.name}'`);
    }

    switch (typeInfo.type) {
      case "value":
        return typeInfo.value;
      case "transient":
        return this.construct(typeInfo);
      case "singleton":
        if (!singletons.has(cls)) {
          singletons.set(cls, this.construct(typeInfo));
        }
        return singletons.get(cls);
    }
  }

  private construct<T>(typeClass: TypeClass<T>): T {
    const params = typeClass.params.map((c) => this.resolve(c));
    return new typeClass.cls(...params);
  }
}

// Singleton instance
const container = new Container();

export default container;
