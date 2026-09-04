import type { RawTutorialContent } from "./tutorial.types";

export const tutorial3Visualization: RawTutorialContent = {
  id: "3-visualization",
  title: "Visualization",
  description:
    "This tutorial will teach you how to visualize different scopes in Cursorless.",
  excludeIn: ["documentation"],
  steps: [
    "The {action:flash} action briefly flashes a target without changing the document: {command:flashState.yml}",
    "The {action:highlight} action keeps a target highlighted so that you can refer back to it visually. Try it now: {command:highlightState.yml}",
    "Unlike {action:flash}, {action:highlight} remains visible until you replace or clear it. Clear the highlight now: {command:highlightNothing.yml}",
    "The scope visualizer shows every instance of a scope in the active editor. Visualize all statements by saying {visualize:state}.",
    "Say {special:visualizeNothing} to hide the scope visualizer. {scopeType:state} is one of many scopes supported by Cursorless. To see all available scopes, have a look at the Scopes section below.",
    "That wraps up the visualization tutorial. Feel free to experiment, then say {special:next} to return to the tutorial list.",
  ],
};
