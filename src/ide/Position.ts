import IPosition from "../libs/common/ide/types/Position";

export default class Position implements IPosition {
  public readonly line: number;
  public readonly character: number;

  constructor(line: number, character: number) {
    this.line = line;
    this.character = character;
  }

  public isEqual(other: Position): boolean {
    return this.line === other.line && this.character === other.character;
  }

  public isBefore(other: IPosition): boolean {
    if (this.line < other.line) {
      return true;
    }
    if (this.line > other.line) {
      return false;
    }
    return this.character < other.character;
  }

  public isAfter(other: IPosition): boolean {
    if (this.line > other.line) {
      return true;
    }
    if (this.line < other.line) {
      return false;
    }
    return this.character > other.character;
  }

  public isBeforeOrEqual(other: Position): boolean {
    return this.isEqual(other) || this.isBefore(other);
  }

  public isAfterOrEqual(other: Position): boolean {
    return this.isEqual(other) || this.isAfter(other);
  }
}
