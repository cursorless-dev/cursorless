import { CheatsheetInfo } from "@cursorless/common";
import { CheatsheetPage } from "@cursorless/cheatsheet";
import "../styles.css";

declare global {
  interface Document {
    /**
     * The data describing the cheatsheet spoken forms.
     *
     * In production, we rely on a hack where we inject the user's actual
     * cheatsheet json into a script tag that places the object on
     * {@link document}.
     */
    cheatsheetInfo: CheatsheetInfo;
  }
}

export function App() {
  return <CheatsheetPage cheatsheetInfo={document.cheatsheetInfo} />;
}

export default App;
