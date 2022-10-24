import isTesting from "../testUtil/isTesting";
import { ExtractMutable } from "./typeUtils";

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
    let returnValue: GraphType[K];

    if (components[key] == null) {
      if (lockedKeys.includes(key)) {
        const cycle = [...lockedKeys.slice(lockedKeys.indexOf(key)), key].join(
          " -> "
        );
        throw new Error(`Dependency injection graph cycle detected: ${cycle}`);
      }
      const factory = factoryMap[key] as (graph: GraphType) => GraphType[K];
      lockedKeys.push(key);
      returnValue = factory(graph);
      if (lockedKeys.pop() !== key) {
        throw new Error("Unexpected key at top of graph stack");
      }
      components[key] = returnValue;
    } else {
      returnValue = components[key] as GraphType[K];
    }

    return returnValue;
  };
}

export default function makeGraph<GraphType extends object>(
  factoryMap: FactoryMap<GraphType>,
  writableKeys: ExtractMutable<GraphType>[] = []
) {
  const components: Partial<GraphType> = {};
  const graph: Partial<GraphType> = {};
  const lockedKeys: (keyof GraphType)[] = [];

  Object.keys(factoryMap).forEach((key: keyof GraphType | PropertyKey) => {
    const isMutable = (
      writableKeys as (keyof GraphType | PropertyKey)[]
    ).includes(key);
    Object.defineProperty(graph, key, {
      get: makeGetter(
        graph as GraphType,
        components,
        factoryMap,
        lockedKeys,
        key as keyof GraphType
      ),

      set: isMutable
        ? (value) => {
            components[key as keyof GraphType] = value;
          }
        : undefined,

      // NB: We allow mutable keys for spying
      configurable: isMutable || isTesting(),
    });
  });

  return graph as GraphType;
}
