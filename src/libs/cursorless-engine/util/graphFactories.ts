import Actions from "../actions";
import Debug from "../core/Debug";
import HatTokenMap from "../core/HatTokenMap";
import { Snippets } from "../core/Snippets";
import StatusBarItem from "../core/StatusBarItem";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import KeyboardCommands from "../../../keyboard/KeyboardCommands";
import { TestCaseRecorder } from "../testCaseRecorder/TestCaseRecorder";
import { Graph } from "../typings/Types";
import { FactoryMap } from "./makeGraph";

type ConstructorMap<T> = {
  [P in keyof T]: new (t: T) => T[P];
};

const graphConstructors: Partial<ConstructorMap<Graph>> = {
  actions: Actions,
  hatTokenMap: HatTokenMap,
  snippets: Snippets,
  rangeUpdater: RangeUpdater,
  debug: Debug,
  testCaseRecorder: TestCaseRecorder,
  statusBarItem: StatusBarItem,
  keyboardCommands: KeyboardCommands,
};

const graphFactories: Partial<FactoryMap<Graph>> = Object.fromEntries(
  Object.entries(graphConstructors).map(([key, constructor]) => [
    key,
    (graph: Graph) => new constructor(graph),
  ]),
);

export default graphFactories;
