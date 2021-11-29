import { PartialTarget } from "../../typings/Types";

export interface CommandArgument {
  spokenForm: string;
  usePrePhraseSnapshot: boolean;
  action: string;
  targets: PartialTarget[];
  extraArgs: unknown[];
}
