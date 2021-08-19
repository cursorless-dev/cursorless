import Actions from "../actions";
import { EditStyles } from "../core/editStyles";
import { Graph } from "../typings/Types";
import { ConstructorMap } from "./makeGraph";
import NavigationMap from "../core/NavigationMap";

const graphConstructors: ConstructorMap<Graph> = {
  actions: Actions,
  editStyles: EditStyles,
  navigationMap: NavigationMap,
};

export default graphConstructors;
