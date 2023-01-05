import Actions from "../actions";
import Cheatsheet from "../core/Cheatsheet";
import Debug from "../core/Debug";
import VscodeHatDecorationMap from "../ide/vscode/VscodeHatDecorationMap";
import { EditStyles } from "../core/editStyles";
import FontMeasurements from "../ide/vscode/FontMeasurements";
import HatTokenMap from "../core/HatTokenMap";
import { Snippets } from "../core/Snippets";
import StatusBarItem from "../core/StatusBarItem";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import KeyboardCommands from "../keyboard/KeyboardCommands";
import { TestCaseRecorder } from "../testUtil/TestCaseRecorder";
import { Graph } from "../typings/Types";
import { FactoryMap } from "./makeGraph";

type ConstructorMap<T> = {
  [P in keyof T]: new (t: T) => T[P];
};

const graphConstructors: Partial<ConstructorMap<Graph>> = {
  actions: Actions,
  editStyles: EditStyles,
  hatTokenMap: HatTokenMap,
  decorations: VscodeHatDecorationMap,
  fontMeasurements: FontMeasurements,
  snippets: Snippets,
  rangeUpdater: RangeUpdater,
  debug: Debug,
  testCaseRecorder: TestCaseRecorder,
  cheatsheet: Cheatsheet,
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
