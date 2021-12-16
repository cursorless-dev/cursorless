import Actions from "../actions";
import { EditStyles } from "../core/editStyles";
import { Graph } from "../typings/Types";
import { FactoryMap } from "./makeGraph";
import HatTokenMap from "../core/HatTokenMap";
import { Snippets } from "../core/Snippets";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import Decorations from "../core/Decorations";
import FontMeasurements from "../core/FontMeasurements";
import Debug from "../core/Debug";

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
};

const graphFactories: Partial<FactoryMap<Graph>> = Object.fromEntries(
  Object.entries(graphConstructors).map(([key, constructor]) => [
    key,
    (graph: Graph) => new constructor(graph),
  ])
);

export default graphFactories;
