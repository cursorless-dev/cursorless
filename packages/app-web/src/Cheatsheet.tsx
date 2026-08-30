import {
  Cheatsheet as OriginalCheatsheet,
  getDefaultCheatsheetInfo,
} from "@cursorless/lib-cheatsheet";
import { Title } from "./Title";

export function Cheatsheet() {
  return (
    <>
      <Title>Cursorless cheatsheet</Title>
      <OriginalCheatsheet cheatsheetInfo={getDefaultCheatsheetInfo()} />
    </>
  );
}
