import Actions from "../actions";
import { EditStyles } from "../core/editStyles";
import { Graph } from "../typings/Types";
import { FactoryMap } from "./makeGraph";
import NavigationMap from "../core/NavigationMap";
import { Snippets } from "../core/Snippets";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";

const graphFactories: Partial<FactoryMap<Graph>> = {
  actions: (graph: Graph) => new Actions(graph),
  editStyles: () => new EditStyles(),
  navigationMap: (graph: Graph) => new NavigationMap(graph),
  snippets: (graph: Graph) => new Snippets(graph),
  rangeUpdater: (graph: Graph) => new RangeUpdater(graph),
};

export default graphFactories;
