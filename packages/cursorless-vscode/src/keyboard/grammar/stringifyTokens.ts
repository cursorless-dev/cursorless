export function stringifyTokens(tokens: any[]) {
  return tokens
    .map((token) => {
      let ret = token.type;
      if (token.value != null) {
        ret += `:${JSON.stringify(token.value)}`;
      }
      return ret;
    })
    .join(" ");
}
