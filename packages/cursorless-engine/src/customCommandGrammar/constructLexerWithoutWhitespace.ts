import { type Lexer } from "moo";

export function constructLexerWithoutWhitespace(lexer: Lexer): Lexer {
  return {
    formatError: (token, message?) => lexer.formatError(token, message),
    has: (tokenType: string) => lexer.has(tokenType),
    save: () => lexer.save(),
    pushState: (state) => lexer.pushState(state),
    popState: () => lexer.popState(),
    setState: (state) => lexer.setState(state),
    reset(chunk?, state?) {
      return constructLexerWithoutWhitespace(lexer.reset(chunk, state));
    },
    next() {
      const token = lexer.next();
      if (token?.type === "ws") {
        return this.next();
      }
      return token;
    },
    *[Symbol.iterator]() {
      for (const token of lexer) {
        if (token.type !== "ws") {
          yield token;
        }
      }
    },
  };
}
