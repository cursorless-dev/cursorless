import { CheatsheetPage, CheatsheetInfo } from "@cursorless/cheatsheet";
import "../styles.css";

/**
 * The data describing the cheatsheet spoken forms.
 *
 * In production, we rely on a hack where we inject the user's actual
 * cheatsheet json into a script tag that places the object on the `document`
 */
const cheatsheetInfo: CheatsheetInfo = (
  document as unknown as { cheatsheetInfo: CheatsheetInfo }
).cheatsheetInfo;

export function App() {
  return <CheatsheetPage cheatsheetInfo={cheatsheetInfo} />;
}

export default App;
