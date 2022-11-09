import getParamTypes from "./getParamTypes";
import { Type, TypeClass, TypeInfo } from "./types";

export const typeInfos = new Map<Type<any>, TypeInfo>();

class Container {
  private register = new Map<Type<any>, TypeInfo>();
  private instances = new Map<Type<any>, any>();

  registerTransient<T>(cls: Type<T>) {
    this.register.set(cls, {
      type: "transient",
      cls,
      params: getParamTypes(cls),
    });
  }

  registerSingleton<T>(cls: Type<T>) {
    this.register.set(cls, {
      type: "singleton",
      cls,
      params: getParamTypes(cls),
    });
  }

  registerValue<T>(cls: Type<T>, value: T) {
    this.register.set(cls, {
      type: "value",
      value,
    });
  }

  resolve<T>(cls: Type<T>): T {
    const typeInfo = this.register.get(cls) ?? typeInfos.get(cls);

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
        if (!this.instances.has(cls)) {
          this.instances.set(cls, this.construct(typeInfo));
        }
        return this.instances.get(cls);
    }
  }

  clearInstances() {
    this.instances.clear();
  }

  reset() {
    this.clearInstances();
    this.register.clear();
  }

  private construct<T>(typeClass: TypeClass<T>): T {
    const params = typeClass.params.map((c) => this.resolve(c));
    return new typeClass.cls(...params);
  }
}

// Singleton instance
const container = new Container();

export default container;
