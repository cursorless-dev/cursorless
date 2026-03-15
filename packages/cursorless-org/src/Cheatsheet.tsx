import {
  Cheatsheet as OriginalCheatsheet,
  defaultCheatsheetInfo,
} from "@cursorless/cheatsheet";

export function Cheatsheet() {
  return (
    <>
      <title>Cursorless cheatsheet</title>
      <OriginalCheatsheet cheatsheetInfo={defaultCheatsheetInfo} />
    </>
  );
}
