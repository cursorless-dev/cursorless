import type { RawTutorialContent } from "./tutorial.types";

export const tutorial2BasicCoding: RawTutorialContent = {
  id: "2-basic-coding",
  title: "Basic coding",
  description:
    "This tutorial will teach you the basics of coding with Cursorless.",
  steps: [
    "When editing code, we often think in terms of statements, functions, etc. Let's clone a statement: {command:cloneStateInk.yml}",
    "Cursorless tries its best to keep your commands short.\nIn the following command, we just say {scopeType:string} once, but Cursorless infers that both targets are strings: {command:swapStringAirWithWhale.yml}",
    "Great. Let's learn a new action. The {action:pour} action lets you start editing a new line below any line on your screen: {command:pourUrge.yml}",
    "Now let's try applying a Cursorless action to the current line: {command:dedentThis.yml}",
    "Code reuse is a fact of life as a programmer. Cursorless makes this easy with the {action:bring} command: {command:bringStateUrge.yml}",
    "{action:bring} also works with two targets just like {action:swap}: {command:bringBlueCapToValueRisk.yml}",
    "Cursorless tries its best to use its knowledge of programming languages to leave you with syntactically valid code.\nNote how it cleans up the comma here: {command:chuckArgueBlueVest.yml}",
    "We introduced a lot of different scopes today. If you're anything like us, you've already forgotten them all.\nThe important thing to remember is that you can always say {special:help} to see a list.",
    "As always, feel free to stick around and play with this file to practice what you've just learned. Happy coding 😊. Say {special:next} to get back home.",
  ],
};
