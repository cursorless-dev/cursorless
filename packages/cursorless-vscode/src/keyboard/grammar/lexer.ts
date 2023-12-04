import { Lexer } from "nearley";
import { TokenTypeKeyMapMap } from "../TokenTypeHelpers";

interface LexerState {
  index: number;
}

interface Token {
  type: string;
  value: any;
}

/**
 * A simple lexer for our keyboard grammar designed to handle a stream of tokens
 * of the form {@link Token}. It passes the token along unchanged to the parser
 * to use when it is checking token types, and exposes a {@link transform}
 * method that the parser will then use to transform the token into the actual
 * value that will be used when constructing rule outputs.
 */
class MyLexer implements Lexer {
  buffer: any[] = [];
  bufferIndex = 0;
  index = 0;

  reset(data: Token[], { index }: LexerState = { index: 0 }) {
    this.buffer = data;
    this.bufferIndex = 0;
    this.index = index;
  }

  next() {
    if (this.bufferIndex < this.buffer.length) {
      this.index++;
      return this.buffer[this.bufferIndex++];
    }
  }

  save() {
    return {
      index: this.index,
    };
  }

  formatError(_token: any, message: string) {
    return message + " at index " + (this.index - 1);
  }

  has(_type: keyof TokenTypeKeyMapMap) {
    return true;
  }

  transform({ value }: Token) {
    return value;
  }
}

export const lexer = new MyLexer();
