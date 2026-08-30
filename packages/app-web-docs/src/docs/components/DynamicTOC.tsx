import { useEffect } from "react";
import { useDynamicTOC } from "./DynamicTOCContext";

interface Props {
  minHeadingLevel?: number;
  maxHeadingLevel?: number;
}

export function DynamicTOC({
  minHeadingLevel = 2,
  maxHeadingLevel = 3,
}: Props) {
  const { setDynamicTOC } = useDynamicTOC();

  useEffect(() => {
    const headings = getHeaderElements(minHeadingLevel, maxHeadingLevel);

    setDynamicTOC({
      items: Array.from(headings, (heading) => ({
        id: heading.id,
        level: Number.parseInt(heading.tagName[1], 10),
        value: heading.textContent ?? "",
      })),
      minHeadingLevel,
      maxHeadingLevel,
    });

    return () => setDynamicTOC(undefined);
  }, [maxHeadingLevel, minHeadingLevel, setDynamicTOC]);

  return null;
}

function getHeaderElements(
  minHeadingLevel: number,
  maxHeadingLevel: number,
): NodeListOf<HTMLHeadingElement> {
  const queryParts = [];
  for (let i = minHeadingLevel; i <= maxHeadingLevel; i++) {
    queryParts.push(`main article h${i}`);
  }
  return document.querySelectorAll(queryParts.join(", "));
}
