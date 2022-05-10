import { CheatsheetPage, CheatsheetInfo } from '@cursorless/cheatsheet';
import { environment } from '../environments/environment';

/**
 * The data describing the cheatsheet spoken forms.
 *
 * In production, we rely on a hack where we inject the user's actual
 * cheatsheet json into a script tag that places the object on the `document`
 *
 * In development, we require the default cheatsheet json so we have something
 * to look at.  We should figure out how to properly respect nx module
 * boundaries and use @cursorless/cheatsheet
 */
const cheatsheetData: CheatsheetInfo = environment.production
  ? (document as unknown as { cheatsheetData: CheatsheetInfo }).cheatsheetData
  : require('libs/cheatsheet/src/lib/data/cheatsheet/defaults.json');

export function App() {
  return <CheatsheetPage cheatsheetInfo={cheatsheetData} />;
}

export default App;
