import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';


import Home from './pages/home';
import Projects from './pages/projects';
import Extension from './pages/extension';
import ownLicence from './pages/ownLicence';
import ownLicence02 from './pages/ownLicence02';
import SmartSwapLicence from './pages/smartSwapLicence';

const DefaultRouter = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={Home} />
    </Switch>
    <Switch>
      <Route path="/ownLicence" component={ownLicence} />
    </Switch>
    <Switch>
      <Route path="/ownLicence02" component={ownLicence02} />
    </Switch>
    <Switch>
      <Route path="/SmartSwapLicence" component={SmartSwapLicence} />
    </Switch>
    <Switch>
      <Route path="/projects" component={Projects} />
    </Switch>
    <Switch>
      <Route path="/extension" component={Extension} />
    </Switch>
  </Router>
)

export default DefaultRouter;