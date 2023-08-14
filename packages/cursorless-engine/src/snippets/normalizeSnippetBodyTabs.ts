import { getLeadingWhitespace } from "../util/regex";

/**
 * Normalizes snippet indentation to tabs.
 * @param body The snippet body to update.
 * @returns The snippet body with space indentations replaced by tabs.
 */
export function normalizeSnippetBodyTabs(body: string): string {
  // If snippet body containins tabs don't touch anything.
  if (body.includes("\t")) {
    return body;
  }

  const lines: { indentation: string; rest: string }[] = [];
  let smallestIndentation: string | undefined = undefined;

  body.split(/\r?\n/).forEach((line) => {
    const indentation = getLeadingWhitespace(line);

    // Keep track of smallest non empty indentation
    if (
      indentation.length > 0 &&
      (smallestIndentation == null ||
        indentation.length < smallestIndentation.length)
    ) {
      smallestIndentation = indentation;
    }

    lines.push({ indentation, rest: line.slice(indentation.length) });
  });

  // No indentation found in snippet body. No change.
  if (smallestIndentation == null) {
    return body;
  }

  return lines
    .map((line) => {
      const indentation = line.indentation.replaceAll(
        smallestIndentation!,
        "\t",
      );
      return `${indentation}${line.rest}`;
    })
    .join("\n");
}
