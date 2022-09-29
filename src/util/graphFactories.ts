import Actions from "../actions";
import Cheatsheet from "../core/Cheatsheet";
import Debug from "../core/Debug";
import Decorations from "../core/Decorations";
import { EditStyles } from "../core/editStyles";
import FontMeasurements from "../core/FontMeasurements";
import HatTokenMap from "../core/HatTokenMap";
import { Snippets } from "../core/Snippets";
import StatusBarItem from "../core/StatusBarItem";
import { TokenGraphemeSplitter } from "../core/TokenGraphemeSplitter";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { VscodeIDE } from "../ide/vscode/VscodeIDE";
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
  decorations: Decorations,
  fontMeasurements: FontMeasurements,
  snippets: Snippets,
  rangeUpdater: RangeUpdater,
  debug: Debug,
  testCaseRecorder: TestCaseRecorder,
  cheatsheet: Cheatsheet,
  statusBarItem: StatusBarItem,
  tokenGraphemeSplitter: TokenGraphemeSplitter,
  ide: VscodeIDE,
  keyboardCommands: KeyboardCommands,
};

const graphFactories: Partial<FactoryMap<Graph>> = Object.fromEntries(
  Object.entries(graphConstructors).map(([key, constructor]) => [
    key,
    (graph: Graph) => new constructor(graph),
  ])
);

export default graphFactories;
