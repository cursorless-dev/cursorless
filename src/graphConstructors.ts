import Actions from "./actions";
import EditStyles from "./editStyles";
import { Graph } from "./Types";
import { ConstructorMap } from "./makeGraph";

const graphConstructors: ConstructorMap<Graph> = {
  actions: Actions,
  editStyles: EditStyles,
};

export default graphConstructors;
