type TextFormatter = (tokens: string[]) => string;

export const textFormatters: Record<TextFormatterName, TextFormatter> = {
  camelCase(tokens: string[]) {
    if (tokens.length === 0) {
      return "";
    }

    const [first, ...rest] = tokens;

    return first + rest.map(capitalizeToken).join("");
  },

  snakeCase(tokens: string[]) {
    return tokens.join("_");
  },

  upperSnakeCase(tokens: string[]) {
    return tokens.map((token) => token.toUpperCase()).join("_");
  },

  pascalCase(tokens: string[]) {
    return tokens.map(capitalizeToken).join("");
  },
};

function capitalizeToken(token: string): string {
  return token.length === 0 ? "" : token[0].toUpperCase() + token.substr(1);
}

export type TextFormatterName =
  | "camelCase"
  | "pascalCase"
  | "snakeCase"
  | "upperSnakeCase";
