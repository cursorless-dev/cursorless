import { Cheatsheet as OriginalCheatsheet } from "@cursorless/lib-cheatsheet";
import { getDefaultCheatsheetInfo } from "@cursorless/lib-common";
import { Title } from "./Title";

export function Cheatsheet() {
  return (
    <>
      <Title>Cursorless cheatsheet</Title>
      <OriginalCheatsheet cheatsheetInfo={getDefaultCheatsheetInfo()} />
    </>
  );
}
