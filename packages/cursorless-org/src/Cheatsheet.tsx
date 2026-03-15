import { Cheatsheet, defaultCheatsheetInfo } from "@cursorless/cheatsheet";

export function Cheatsheet() {
  return (
    <>
      <title>Cursorless cheatsheet</title>
      <Cheatsheet cheatsheetInfo={defaultCheatsheetInfo} />
    </>
  );
}
