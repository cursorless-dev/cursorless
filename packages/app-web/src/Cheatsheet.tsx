import { Cheatsheet as OriginalCheatsheet } from "@cursorless/lib-cheatsheet";
import defaultCheatsheetInfo from "@cursorless/lib-cheatsheet/defaultSpokenForms";
import { Title } from "./Title";

export function Cheatsheet() {
  return (
    <>
      <Title>Cursorless cheatsheet</Title>
      <OriginalCheatsheet cheatsheetInfo={defaultCheatsheetInfo} />
    </>
  );
}
