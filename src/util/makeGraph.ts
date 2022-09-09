import isTesting from "../testUtil/isTesting";

export type FactoryMap<T> = {
  [P in keyof T]: (t: T) => T[P];
};

function makeGetter<GraphType, K extends keyof GraphType>(
  graph: GraphType,
  components: Partial<GraphType>,
  factoryMap: FactoryMap<GraphType>,
  lockedKeys: K[],
  key: K
): () => GraphType[K] {
  return () => {
    const componentValue = components[key];
    if (componentValue != null) {
      return componentValue;
    }

    if (lockedKeys.includes(key)) {
      const cycle = [...lockedKeys.slice(lockedKeys.indexOf(key)), key].join(
        " -> "
      );
      throw new Error(`Dependency injection graph cycle detected: ${cycle}`);
    }
    const factory = factoryMap[key];
    lockedKeys.push(key);
    const returnValue = factory(graph);
    if (lockedKeys.pop() !== key) {
      throw new Error("Unexpected key at top of graph stack");
    }
    components[key] = returnValue;
    return returnValue;
  };
}

export default function makeGraph<GraphType extends object>(
  factoryMap: FactoryMap<GraphType>
) {
  const components: Partial<GraphType> = {};
  const graph: Partial<GraphType> = {};
  const lockedKeys: (keyof GraphType)[] = [];

  Object.keys(factoryMap).forEach((key: keyof GraphType | PropertyKey) => {
    Object.defineProperty(graph, key, {
      get: makeGetter(
        graph as GraphType,
        components,
        factoryMap,
        lockedKeys,
        key as keyof GraphType
      ),

      // NB: If we're testing, we make property mutable to allow mocking
      configurable: isTesting(),
    });
  });

  return graph as GraphType;
}
