import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import CheatsheetPage from "./cheatsheet";
import LandingPage from "./index";

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact={true} path="/">
          <LandingPage />
        </Route>
        <Route exact={true} path="/cheatsheet">
          <CheatsheetPage />
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}
