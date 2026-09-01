import React, { useEffect, useState } from "react";
import type { DecorationItem, OffsetOrPosition } from "shiki";
import { codeToHtml } from "shiki";
import "./Code.css";

interface Props {
  languageId: string;
  renderWhitespace?: boolean;
  decorations?: DecorationItem[];
  link?: {
    name: string;
    url: string;
  };
  children: string;
}

export function Code({
  languageId,
  renderWhitespace,
  decorations,
  link,
  children,
}: Props) {
  const [html, setHtml] = React.useState<{ __html: string }>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const code = renderWhitespace
        ? children.replaceAll(" ", "␣").replaceAll("\t", "⭾")
        : children;

      try {
        let html = await codeToHtml(code, {
          lang: getFallbackLanguage(languageId),
          theme: "nord",
          decorations,
          transformers: [
            // Shiki omits decorations for empty lines. This transformation adds the cursor class to the line itself if needed.
            {
              name: "cursor-lines",
              line(node, line) {
                if (node.children.length === 0 && decorations != null) {
                  const hasDecoration = decorations.some((d) => {
                    return (
                      isPositionsEqual(d.start, d.end) &&
                      typeof d.start !== "number" &&
                      d.start.line === line - 1 &&
                      d.start.character === 0
                    );
                  });
                  if (hasDecoration) {
                    // oxlint-disable-next-line react/todo
                    this.addClassToHast(node, "code-cursor-after");
                  }
                }
                return node;
              },
            },
          ],
        });
        if (renderWhitespace) {
          html = html
            .replaceAll("␣", '<span class="code-ws-symbol">·</span>')
            .replaceAll("⭾", '<span class="code-ws-symbol"> →  </span>');
        }
        setHtml({ __html: html });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [languageId, renderWhitespace, decorations, children]);

  if (html == null) {
    return <div className="code-container" />;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy!", error);
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
      <button type="button" onClick={handleCopy} className="code-copy-button">
        {copied ? "✅ Copied!" : "📋 Copy"}
      </button>
      <div
        // oxlint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={html}
      />
    </div>
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
    case "talon-list":
      return "talon";
    default:
      return languageId;
  }
}

function isPositionsEqual(a: OffsetOrPosition, b: OffsetOrPosition) {
  if (typeof a === "number" || typeof b === "number") {
    return a === b;
  }
  return a.line === b.line && a.character === b.character;
}
