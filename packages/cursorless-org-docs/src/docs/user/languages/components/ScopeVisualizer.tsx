import React, { useEffect } from "react";
import {
  codeToHtml,
  createCssVariablesTheme,
  createHighlighter as shikiCreateHighlighter,
  type DecorationItem,
} from "shiki";
import "./ScopeVisualizer.css";

interface Props {
  languageId: string;
}

const myTheme = createCssVariablesTheme({
  //   variablePrefix: "--code-",
  fontStyle: true,
});

export function ScopeVisualizer({ languageId }: Props) {
  const [html, setHtml] = React.useState("");
  useEffect(() => {
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

    const decorations: DecorationItem[] = [
      {
        start: { line: 0, character: 1 },
        end: { line: 0, character: 3 },
        properties: {
          class: "shiki-highlight-content",
        },
      },
    ];

    codeToHtml(code, {
      lang: "javascript",
      theme: myTheme,
      decorations,
    }).then(setHtml);
  }, []);

  console.log("html", html);

  return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
}
