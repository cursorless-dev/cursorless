import { Range } from "@cursorless/common";
import React, { useEffect } from "react";
import {
  codeToHtml,
  createCssVariablesTheme,
  type DecorationItem,
} from "shiki";
import "./Code.css";

export interface Highlight {
  type: "content" | "removal" | "domain" | "iteration";
  range: Range;
}

interface Props {
  languageId: string;
  highlights?: Highlight[];
  children: string;
}

const myTheme = createCssVariablesTheme({
  fontStyle: true,
});

export function Code({ languageId, highlights, children }: Props) {
  const [html, setHtml] = React.useState("");

  useEffect(() => {
    codeToHtml(children, {
      lang: languageId,
      theme: myTheme,
      decorations: getDecorations(highlights),
    }).then(setHtml);
  }, [languageId, highlights, children]);

  return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
}

function getDecorations(
  highlights?: Highlight[],
): DecorationItem[] | undefined {
  if (highlights == null || highlights.length === 0) {
    return undefined;
  }

  return highlights.map((highlight): DecorationItem => {
    const { start, end } = highlight.range;
    return {
      start,
      end,
      properties: {
        class: `shiki-highlight-${highlight.type}`,
      },
    };
  });
}
