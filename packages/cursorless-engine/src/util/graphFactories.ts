import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { Graph } from "../typings/Graph";
import { FactoryMap } from "./makeGraph";

type ConstructorMap<T> = {
  [P in keyof T]: new (t: T) => T[P];
};

const graphConstructors: Partial<ConstructorMap<Graph>> = {
  rangeUpdater: RangeUpdater,
};

export const graphFactories: Partial<FactoryMap<Graph>> = Object.fromEntries(
  Object.entries(graphConstructors).map(([key, constructor]) => [
    key,
    (graph: Graph) => new constructor(graph),
  ]),
);
