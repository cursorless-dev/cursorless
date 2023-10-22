

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
    ".": `mode.run("collectionKey");`,

    "i": `mode.run("replaceWithTarget");`,
    "o": `mode.run("clearAndSetSelection");`,
    "m": `mode.run("setSelectionBefore");`,
    "n": `mode.run("setSelectionAfter");`,

    "k": `mode.setKeybindingLayer(1);`,
    "a": `mode.toggleCombineTargets();`,
    "j": `mode.clearTargets();`,

    ";": `mode.setKeybindingLayer(2);`,
    
}

export const layer1 = {
    "h": "mode.run('editNewLineBefore');",
    "t": "mode.run('editNewLineAfter');",
}

export const layer2 = {
    "[": "mode.run('squareBrackets');",
    "{": "mode.run('curlyBrackets');",
    "(": "mode.run('parentheses');",
    "<": "mode.run('angleBrackets');",

    "]": "mode.run('squareBrackets');",
    "}": "mode.run('curlyBrackets');",
    ")": "mode.run('parentheses');",
    ">": "mode.run('angleBrackets');",

    ",": "mode.run('any');",
    ";": "mode.run('interiorOnly');",
    ".": "mode.run('excludeInterior');",



}