import Actions from "../actions";
import Debug from "../core/Debug";
import HatTokenMapImpl from "../core/HatTokenMapImpl";
import { Snippets } from "../core/Snippets";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { TestCaseRecorder } from "../testCaseRecorder/TestCaseRecorder";
import { Graph } from "../typings/Graph";
import { FactoryMap } from "./makeGraph";

type ConstructorMap<T> = {
  [P in keyof T]: new (t: T) => T[P];
};

const graphConstructors: Partial<ConstructorMap<Graph>> = {
  actions: Actions,
  hatTokenMap: HatTokenMapImpl,
  snippets: Snippets,
  rangeUpdater: RangeUpdater,
  debug: Debug,
  testCaseRecorder: TestCaseRecorder,
};

export const graphFactories: Partial<FactoryMap<Graph>> = Object.fromEntries(
  Object.entries(graphConstructors).map(([key, constructor]) => [
    key,
    (graph: Graph) => new constructor(graph),
  ]),
);
