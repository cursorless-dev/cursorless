import isTesting from "../testUtil/isTesting";

export type FactoryMap<T> = {
  [P in keyof T]: (t: T) => T[P];
};

function makeGetter<GraphType, K extends keyof GraphType>(
  graph: GraphType,
  components: Partial<GraphType>,
  factoryMap: FactoryMap<GraphType>,
  key: K
): () => GraphType[K] {
  return () => {
    var returnValue: GraphType[K];

    if (components[key] == null) {
      const factory = factoryMap[key] as (graph: GraphType) => GraphType[K];
      returnValue = factory(graph);
      components[key] = returnValue;
    } else {
      returnValue = components[key] as GraphType[K];
    }

    return returnValue;
  };
}

export default function makeGraph<GraphType extends object>(
  factoryMap: FactoryMap<GraphType>
) {
  const components: Partial<GraphType> = {};
  const graph: Partial<GraphType> = {};

  Object.keys(factoryMap).forEach((key: keyof GraphType | PropertyKey) => {
    Object.defineProperty(graph, key, {
      get: makeGetter(
        graph as GraphType,
        components,
        factoryMap,
        key as keyof GraphType
      ),

      // NB: If we're testing, we make property mutable to allow mocking
      configurable: isTesting(),
    });
  });

  return graph as GraphType;
}
