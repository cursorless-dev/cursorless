import React, { useEffect, useState } from "react";
import { codeToHtml, type DecorationItem } from "shiki";
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
  const [html, setHtml] = React.useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (renderWhitespace) {
      children = children.replaceAll(" ", "␣").replaceAll("\t", "⭾");
    }
    codeToHtml(children, {
      lang: getFallbackLanguage(languageId),
      theme: "nord",
      decorations,
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
  }, [languageId, renderWhitespace, decorations, link, children]);

  if (!html) {
    return <div className="code-container" />;
  }

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
