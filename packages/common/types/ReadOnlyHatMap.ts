import { HatStyleName } from "../ide/types/hatStyles.types";
import { Token } from "./Token";

export interface ReadOnlyHatMap {
  getEntries(): readonly [string, Token][];
  getToken(hatStyle: HatStyleName, character: string): Token;
}
