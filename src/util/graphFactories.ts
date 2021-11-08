import Actions from "../actions";
import { EditStyles } from "../core/editStyles";
import { Graph } from "../typings/Types";
import { FactoryMap } from "./makeGraph";
import NavigationMap from "../core/NavigationMap";
import { Snippets } from "../core/Snippets";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import Decorations from "../core/Decorations";
import FontMeasurements from "../core/FontMeasurements";

type ConstructorMap<T> = {
  [P in keyof T]: new (t: T) => T[P];
};

const graphConstructors: Partial<ConstructorMap<Graph>> = {
  actions: Actions,
  editStyles: EditStyles,
  navigationMap: NavigationMap,
  decorations: Decorations,
  fontMeasurements: FontMeasurements,
  snippets: Snippets,
  rangeUpdater: RangeUpdater,
};

const graphFactories: Partial<FactoryMap<Graph>> = Object.fromEntries(
  Object.entries(graphConstructors).map(([key, constructor]) => [
    key,
    (graph: Graph) => new constructor(graph),
  ])
);

export default graphFactories;
