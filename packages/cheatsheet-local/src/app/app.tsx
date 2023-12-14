import { CheatsheetInfo, FeatureUsageStats } from "@cursorless/common";
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

    /**
     * The data describing the cheatsheet feature usage stats.
     * Injected in the same way as {@link cheatsheetInfo}.
     */
    cheatsheetFeatureUsageStats: FeatureUsageStats;
  }
}

export function App() {
  return (
    <CheatsheetPage
      cheatsheetInfo={document.cheatsheetInfo}
      cheatsheetFeatureUsageStats={document.cheatsheetFeatureUsageStats}
    />
  );
}

export default App;
