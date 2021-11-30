import { PartialTarget } from "../../typings/Types";

export interface CommandArgument {
  version: 0 | 1;
  spokenForm: string;
  usePrePhraseSnapshot: boolean;
  action: string;
  targets: PartialTarget[];
  extraArgs: unknown[];
}
