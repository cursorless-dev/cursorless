import {
  BORDER_WIDTH,
  getBorderColor,
  getBorderRadius,
  getBorderStyle,
  type BorderStyle,
  type Range,
} from "@cursorless/common";
import React, { useEffect, useState } from "react";
import { codeToHtml, type DecorationItem } from "shiki";
import "./Code.css";

export interface Highlight {
  range: Range;
  style: Style;
}

export interface Style {
  backgroundColor: string;
  borderColorSolid: string;
  borderColorPorous: string;
  borderStyle: {
    top: BorderStyle;
    bottom: BorderStyle;
    left: BorderStyle;
    right: BorderStyle;
  };
}

interface Props {
  languageId: string;
  renderWhitespace?: boolean;
  highlights?: Highlight[];
  link?: {
    name: string;
    url: string;
  };
  children: string;
}

export function Code({
  languageId,
  renderWhitespace,
  highlights,
  link,
  children,
}: Props) {
  const [html, setHtml] = React.useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (renderWhitespace) {
      children = children.replaceAll(" ", "␣").replaceAll("\t", "⭾");
    }
    codeToHtml(children, {
      lang: getFallbackLanguage(languageId),
      theme: "nord",
      decorations: getDecorations(highlights),
    })
      .then((html) => {
        if (renderWhitespace) {
          html = html
            .replace(/␣/g, '<span class="code-ws-symbol">·</span>')
            .replace(/⭾/g, '<span class="code-ws-symbol"> →  </span>');
        }
        setHtml(html);
      })
      .catch(console.error);
  }, [languageId, renderWhitespace, highlights, children]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const renderLink = () => {
    if (link == null) {
      return null;
    }
    return (
      <a
        className="code-link header-github-link"
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {link.name}
      </a>
    );
  };

  return (
    <div className="code-container">
      {renderLink()}
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
        style: getStyleString(highlight.style),
      },
    };
  });
}

function getStyleString(style: Style): string {
  const borderColor = getBorderColor(
    style.borderColorSolid,
    style.borderColorPorous,
    style.borderStyle,
  );
  return (
    `background-color: ${style.backgroundColor};` +
    `border-color: ${borderColor};` +
    `border-style: ${getBorderStyle(style.borderStyle)};` +
    `border-radius: ${getBorderRadius(style.borderStyle)};` +
    `border-width: ${BORDER_WIDTH};`
  );
}

// Use a fallback language for languages that are not supported by Shiki
// https://shiki.style/languages
function getFallbackLanguage(languageId: string): string {
  switch (languageId) {
    case "javascriptreact":
      return "jsx";
    case "typescriptreact":
      return "tsx";
    case "scm":
      return "scheme";
    default:
      return languageId;
  }
}
