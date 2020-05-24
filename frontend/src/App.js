import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import NotFound from './views/notFound/NotFound';
import Root from './views/root/Root';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Root}/>
        {/* <Route path="/:id"/> */}
        <Route path="/add/:id"/>
        <Route path="/room/:id"/>
        <Route path="*" component={NotFound}/>
      </Switch>
    </Router>
  );
}

export default App;
