import { useEffect } from "react";

interface Props {
  minHeadingLevel?: number;
  maxHeadingLevel?: number;
}

export function DynamicTOC({
  minHeadingLevel = 2,
  maxHeadingLevel = 3,
}: Props) {
  useEffect(() => {
    const row = document.querySelector("main .row");

    if (row == null) {
      console.error("No row found in the main element");
      return;
    }

    row.appendChild(getTOC(minHeadingLevel, maxHeadingLevel));
  }, []);

  return null;
}

function getTOC(minHeadingLevel: number, maxHeadingLevel: number) {
  const col = document.createElement("div");
  col.className = "col col--3";

  const toc = document.createElement("div");
  toc.className = "tableOfContents_tkZC thin-scrollbar";

  const ul = document.createElement("ul");
  ul.className = "table-of-contents table-of-contents__left-border";

  let currentLevel: number | undefined = undefined;
  let indent = 0;

  getHeaderElements(minHeadingLevel, maxHeadingLevel).forEach((header) => {
    const level = parseInt(header.tagName[1], 10);

    if (level !== currentLevel) {
      if (currentLevel != null) {
        indent += level < currentLevel ? -1 : 1;
      }
      currentLevel = level;
    }

    const li = document.createElement("li");

    const a = document.createElement("a");
    a.href = `#${header.id}`;
    a.className = "table-of-contents__link";
    a.textContent = header.textContent;
    a.style.paddingLeft = `${indent}rem`;

    li.appendChild(a);
    ul.appendChild(li);
  });

  toc.appendChild(ul);
  col.appendChild(toc);

  return col;
}

function getHeaderElements(
  minHeadingLevel: number,
  maxHeadingLevel: number,
): NodeListOf<HTMLHeadingElement> {
  const queryParts = [];
  for (let i = minHeadingLevel; i <= maxHeadingLevel; i++) {
    queryParts.push(`h${i}`);
  }
  return document.querySelectorAll(queryParts.join(", "));
}
