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
  const headingElements = Array.from(document.querySelectorAll("h3")).map(
    (el) => ({
      id: el.id,
      text: el.textContent?.replace("#", "") ?? "",
    }),
  );

  const col = document.createElement("div");
  col.className = "col col--3";

  const toc = document.createElement("div");
  toc.className = "tableOfContents_tkZC thin-scrollbar";
  toc.style.position = "fixed";
  toc.style.right = "1rem";
  toc.style.width = "14rem";
  col.appendChild(toc);

  const ul = document.createElement("ul");
  ul.className = "table-of-contents table-of-contents__left-border";
  toc.appendChild(ul);

  headingElements.forEach((h) => {
    const li = document.createElement("li");

    const a = document.createElement("a");
    a.href = `#${h.id}`;
    a.className = "table-of-contents__link";
    a.textContent = h.text;

    li.appendChild(a);
    ul.appendChild(li);
  });

  return col;
}
