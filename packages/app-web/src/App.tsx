import { Redirect, Route, Router, Switch } from "wouter-preact";
import { Cheatsheet } from "./Cheatsheet";
import { LandingPage } from "./LandingPage";

export function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={LandingPage} />

        <Route path="/cheatsheet" component={Cheatsheet} />

        <Redirect to="/" />
      </Switch>
    </Router>
  );
}
