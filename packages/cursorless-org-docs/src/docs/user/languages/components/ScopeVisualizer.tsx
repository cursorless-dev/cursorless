import { Range } from "@cursorless/common";
import React from "react";
import { createCssVariablesTheme } from "shiki";
import { Code, Highlight } from "./Code";

interface Props {
  languageId: string;
}

const myTheme = createCssVariablesTheme({
  //   variablePrefix: "--code-",
  fontStyle: true,
});

export function ScopeVisualizer({ languageId }: Props) {
  const code = `\
import { createHighlighter } from 'shiki'

// \`createHighlighter\` is async, it initializes the internal and
// loads the themes and languages specified.
const highlighter = await createHighlighter({
  themes: ['nord'],
  langs: ['javascript'],
})

// then later you can use \`highlighter.codeToHtml\` synchronously
// with the loaded themes and languages.
const code = highlighter.codeToHtml('const a = 1', {
  lang: 'javascript',
  theme: 'nord'
})
    `;

  const highlights: Highlight[] = [
    { type: "domain", range: new Range(0, 7, 0, 28) },
    { type: "content", range: new Range(0, 9, 0, 26) },
  ];

  return (
    <Code languageId="javascript" highlights={highlights}>
      {code}
    </Code>
  );
}
