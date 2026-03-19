import { Cheatsheet as OriginalCheatsheet } from "@cursorless/lib-cheatsheet";
import defaultCheatsheetInfo from "@cursorless/lib-cheatsheet/defaultSpokenForms";

export function Cheatsheet() {
  return (
    <>
      <title>Cursorless cheatsheet</title>
      <OriginalCheatsheet cheatsheetInfo={defaultCheatsheetInfo} />
    </>
  );
}
