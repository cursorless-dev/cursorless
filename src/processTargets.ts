import { Selection } from "vscode";
import NavigationMap from "./NavigationMap";
import { Target } from "./Types";

export default function processTargets(
  navigationMap: NavigationMap,
  targets: Target[]
): Selection[][] {
  targets.map((target) => {
    switch (target.type) {
      case "list":
        // target.elements.map((element) => {});
        throw new Error("Not implemented");
        break;
      case "primitive":
        break;
    }
  });
  const token = navigationMap!.getToken("red", "h");
  return [[new Selection(token.range.start, token.range.end)]];
}
