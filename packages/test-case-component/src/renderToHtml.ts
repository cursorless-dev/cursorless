// forked from https://github.com/SimeonC/shiki/blob/main/packages/shiki/src/renderer.ts
import { htmlEscape } from 'escape-goat';
import type { ThemedToken } from "shiki";

// MIT License
const fontStyles = {
  notSet: -1,
  none: 0,
  italic: 1,
  bold: 2,
  underline: 4,
} as const;

export function groupBy<TObject>(
  elements: TObject[],
  keyGetter: (element: TObject) => string,
) {
  const map = new Map();
  for (const element of elements) {
    const key = keyGetter(element);
    if (map.has(key)) {
      const group = map.get(key);
      group.push(element);
    } else {
      map.set(key, [element]);
    }
  }
  return map;
}

export type HatType = "default";
interface BaseElementProps {
  style?: string;
  children: string;
  className?: string;
}

const elements = {
  pre({ className, style = "", children }: BaseElementProps) {
    return `<pre class="${className}" style="${style}">${children}</pre>`;
  },

  code({ children }: Pick<BaseElementProps, "children">) {
    return `<code>${children}</code>`;
  },

  line({ className, children }: Omit<BaseElementProps, "style">) {
    return `<span class="${className}">${children}</span>`;
  },

  token({ style = "", children }: Omit<BaseElementProps, "className">) {
    return `<span style="${style}">${children}</span>`;
  },

  selection({ style = "", className, children }: BaseElementProps) {
    return `<span className="${className}" style="${style}">${children}</span>`;
  },

  hat({ hatType, children }: { hatType: HatType; children: string }) {
    return `<span class="hat ${hatType}">${children}</span>`;
  },
} as const;
export type SelectionType =
  | "decoration"
  | "selection"
  | "thatMark"
  | "sourceMark";
export type Token =
  | ({
      type: "token";
    } & ThemedToken)
  | {
      type: "selection";
      className: string;
      selection: Token[];
    }
  | {
      type: "hat";
      hatType: HatType;
      content: string;
    };

export function renderToHtml(
  lines: Token[][],
  options: {
    langId?: string;
    bg?: string;
    fg?: string;
    lineOptions?: { line: string }[];
  } = {},
) {
  const bg = options.bg || "#fff";
  const optionsByLineNumber = groupBy(
    options.lineOptions ?? [],
    (option) => option.line,
  );

  function h<
    TType extends keyof typeof elements,
    TProps extends BaseElementProps = Parameters<(typeof elements)[TType]>[0],
  >(type: TType, props: Omit<TProps, "children">, children: string[]) {
    const element = elements[type] as (typeof elements)[TType];
    if (element) {
      children = children.filter(Boolean);

      return element({
        ...props,
        children: type === "code" ? children.join("\n") : children.join(""),
      } as any);
    }

    return "";
  }

  function handleToken(token: Token): string {
    if (token.type === "selection") {
      return h(
        "selection",
        { className: token.className },
        token.selection.map((token) => handleToken(token)),
      );
    }
    if (token.type === "hat") {
      return h("hat", token, [escapeHtml(token.content)]);
    }

    const cssDeclarations = [`color: ${token.color || options.fg}`];
    if (token.fontStyle && fontStyles.italic) {
      cssDeclarations.push("font-style: italic");
    }
    if (token.fontStyle && fontStyles.bold) {
      cssDeclarations.push("font-weight: bold");
    }
    if (token.fontStyle && fontStyles.underline) {
      cssDeclarations.push("text-decoration: underline");
    }

    return h(
      "token",
      {
        style: cssDeclarations.join("; "),
      },
      [escapeHtml(token.content)],
    );
  }

  return h("pre", { className: "shiki", style: `background-color: ${bg}` }, [
    options.langId ? `<div class="language-id">${options.langId}</div>` : "",
    h(
      "code",
      {},
      lines.map((line, index) => {
        const lineNumber = index + 1;
        const lineOptions = optionsByLineNumber.get(lineNumber) ?? [];
        const lineClasses = getLineClasses(lineOptions).join(" ");
        return h(
          "line",
          {
            className: lineClasses,
          },
          line.length === 0
            ? ["&nbsp;"]
            : line.map((token) => handleToken(token)),
        );
      }),
    ),
  ]);
}

function escapeHtml(html: string) {
  return htmlEscape(html);
}

function getLineClasses(lineOptions: { classes?: string }[]) {
  const lineClasses = new Set(["line"]);
  for (const lineOption of lineOptions) {
    for (const lineClass of lineOption.classes ?? []) {
      lineClasses.add(lineClass);
    }
  }
  return Array.from(lineClasses);
}
