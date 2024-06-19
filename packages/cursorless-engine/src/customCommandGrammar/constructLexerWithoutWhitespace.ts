import moo, { type Lexer, type LexerState, type Rules, type Token } from "moo";

export function constructLexerWithoutWhitespace(rules: Rules): Lexer {
  const lexer = moo.compile(rules);
  return new LexerWithoutWhitespace(lexer);
}

class LexerWithoutWhitespace implements Lexer {
  constructor(private lexer: Lexer) {}

  formatError(token: Token, message?: string): string {
    return this.lexer.formatError(token, message);
  }

  has(tokenType: string): boolean {
    return this.lexer.has(tokenType);
  }

  save(): LexerState {
    return this.lexer.save();
  }

  pushState(state: string): void {
    this.lexer.pushState(state);
  }

  popState(): void {
    this.lexer.popState();
  }

  setState(state: string): void {
    this.lexer.setState(state);
  }

  reset(chunk?: string, state?: LexerState): this {
    this.lexer.reset(chunk, state);
    return this;
  }

  next(): Token | undefined {
    const token = this.lexer.next();
    if (token != null && this.skipToken(token)) {
      return this.next();
    }
    return token;
  }

  *[Symbol.iterator](): Iterator<Token> {
    for (const token of this.lexer) {
      if (!this.skipToken(token)) {
        yield token;
      }
    }
  }

  transform({ value }: Token) {
    return value;
  }

  private skipToken(token: Token) {
    return token.type === "ws";
  }
}
