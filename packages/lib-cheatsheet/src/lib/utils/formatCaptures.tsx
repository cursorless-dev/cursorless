import type { ComponentChildren } from "preact";
import { SmartLink } from "./SmartLink";

export function formatCaptures(input: string): ComponentChildren[] {
  const parts: ComponentChildren[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(captureRegex)) {
    const [fullMatch, capture] = match;
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(input.slice(lastIndex, index));
    }

    const innerElement =
      capture === "ordinal" ? (
        <span>
          n<sup>th</sup>
        </span>
      ) : (
        capture
      );

    parts.push(
      <span key={index} className="cheatsheet-capture">
        <SmartLink to="#legend" noFormatting>
          [{innerElement}]
        </SmartLink>
      </span>,
    );

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < input.length) {
    parts.push(input.slice(lastIndex));
  }

  return parts;
}

const captureRegex = /<([^>]+)>/gu;
