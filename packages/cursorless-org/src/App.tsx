import { Redirect, Route, Router, Switch } from "wouter";
import { CheatsheetPage } from "./CheatsheetPage";
import { LandingPage } from "./LandingPage";

export function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={LandingPage} />

        <Route path="/cheatsheet" component={CheatsheetPage} />

        <Redirect to="/" />
      </Switch>
    </Router>
  );
}
