

export const layer0 = {
    "d": `mode.run("default");`,
    "b": `mode.run("blue");`,
    "g": `mode.run("green");`,
    "r": `mode.run("red");`,
    "c": `mode.run("yellow");`,
    "x": `mode.run("ex");`,
    "f": `mode.run("fox");`,

    "p": `mode.run("paragraph");`,
    ",": `mode.run("line");`,
    ".": `mode.run("statement");`,

    "i": `mode.run("replaceWithTarget");`,
    "o": `mode.run("clearAndSetSelection");`,
    "m": `mode.run("setSelectionBefore");`,
    "n": `mode.run("setSelectionAfter");`,

    "k": `mode.setKeybindingLayer(1);`,
    "a": `mode.toggleCombineTargets();`,
    "j": `mode.clearTargets();`,
}

export const layer1 = {
    "h": "mode.run('editNewLineBefore');",
    "t": "mode.run('editNewLineAfter');",
}