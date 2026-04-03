import React, { useEffect, useState } from "react";
import type { DecorationItem } from "shiki";
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
  }, [languageId, renderWhitespace, decorations, link, children]);

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
      <div dangerouslySetInnerHTML={html} />{" "}
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
