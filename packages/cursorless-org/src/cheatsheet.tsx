import {
  cheatsheetBodyClasses,
  CheatsheetPage,
  defaultCheatsheetInfo,
} from "@cursorless/cheatsheet";
import { Helmet } from "@slorber/react-helmet-async";
import { useBodyClasses } from "../components/useBodyClasses";

export function App() {
  useBodyClasses(cheatsheetBodyClasses);

  return (
    <>
      <Helmet>
        <title>Cursorless cheatsheet</title>
      </Helmet>
      <CheatsheetPage cheatsheetInfo={defaultCheatsheetInfo} />
    </>
  );
}

export default App;
