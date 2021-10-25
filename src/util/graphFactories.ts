import Actions from "../actions";
import { EditStyles } from "../core/editStyles";
import { Graph } from "../typings/Types";
import { FactoryMap } from "./makeGraph";
import NavigationMap from "../core/NavigationMap";
import { Snippets } from "../core/Snippets";

const graphFactories: Partial<FactoryMap<Graph>> = {
  actions: (graph: Graph) => new Actions(graph),
  editStyles: () => new EditStyles(),
  navigationMap: () => new NavigationMap(),
  snippets: (graph: Graph) => new Snippets(graph),
};

export default graphFactories;
