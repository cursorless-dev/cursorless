import { createHighlighter as shikiCreateHighlighter, createCssVariablesTheme } from "shiki";

const myTheme = createCssVariablesTheme({
    name: "css-variables",
    variablePrefix: "--shiki-",
    variableDefaults: {},
    fontStyle: true,
});

export function createHighlighter() {
    return shikiCreateHighlighter({
        themes: [myTheme],
        langs: ["javascript", "typescript", "python", "markdown"],
    });
}
