import { useEffect } from "react";

export default function DynamicTOC() {
  useEffect(() => {
    const row = document.querySelector("main .row");

    if (row == null) {
      console.error("No row found in the main element");
      return;
    }

    row.appendChild(getTOC());
  }, []);

  return null;
}

function getTOC() {
  const col = document.createElement("div");
  col.className = "col col--3";

  const toc = document.createElement("div");
  toc.className = "tableOfContents_tkZC thin-scrollbar";

  const ul = document.createElement("ul");
  ul.className = "table-of-contents table-of-contents__left-border";

  document.querySelectorAll("h3").forEach((header) => {
    const li = document.createElement("li");

    const a = document.createElement("a");
    a.href = `#${header.id}`;
    a.className = "table-of-contents__link";
    a.textContent = header.textContent;

    li.appendChild(a);
    ul.appendChild(li);
  });

  toc.appendChild(ul);
  col.appendChild(toc);

  return col;
}
