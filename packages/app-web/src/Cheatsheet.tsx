import { Cheatsheet as OriginalCheatsheet } from "@cursorless/cheatsheet";
import defaultCheatsheetInfo from "@cursorless/cheatsheet/defaultSpokenForms";

export function Cheatsheet() {
  return (
    <>
      <title>Cursorless cheatsheet</title>
      <OriginalCheatsheet cheatsheetInfo={defaultCheatsheetInfo} />
    </>
  );
}
