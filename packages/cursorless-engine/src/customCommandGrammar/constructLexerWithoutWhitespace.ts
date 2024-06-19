import type { Lexer, Token } from "moo";

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
      if (skipToken(token)) {
        return this.next();
      }
      return token;
    },

    *[Symbol.iterator]() {
      for (const token of lexer) {
        if (!skipToken(token)) {
          yield token;
        }
      }
    },
  };
}

function skipToken(token?: Token) {
  return token?.type === "ws";
}
