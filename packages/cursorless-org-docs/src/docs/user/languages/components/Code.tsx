import { Range } from "@cursorless/common";
import React, { useEffect, useState } from "react";
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

const myTheme = createCssVariablesTheme();

export function Code({ languageId, highlights, children }: Props) {
  const [html, setHtml] = React.useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    codeToHtml(children, {
      lang: languageId,
      theme: "nord",
      decorations: getDecorations(highlights),
    }).then(setHtml);
  }, [languageId, highlights, children]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="code-container">
      <button onClick={handleCopy} className="code-copy-button">
        {copied ? "✅ Copied!" : "📋 Copy"}
      </button>
      <div dangerouslySetInnerHTML={{ __html: html }}></div>{" "}
    </div>
  );
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
      alwaysWrap: true,
      properties: {
        class: `code-highlight-${highlight.type}`,
      },
    };
  });
}
