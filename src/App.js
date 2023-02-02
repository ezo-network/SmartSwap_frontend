import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import DefaultLayout from "./layouts/DefaultLayout";
import Home from './pages/home';
import Projects from './pages/projects';
import Extension from './pages/extension';
import ownLicence from './pages/ownLicence';
import ownLicence02 from './pages/ownLicence02';
import SmartSwapLicence from './pages/smartSwapLicence';
import FreeListing from './components/free-listing/FreeListing';
import Welcome from './pages/welcome';
import SmartExtension from './pages/smartExtension';
import SmartBridge from './pages/smartBridge';
// import SmartPayment from './pages/smartPayment';

const DefaultRouter = () => (
  <Router>
    <DefaultLayout>
      <Switch>
        <Route path="/" exact component={Home} />
      </Switch>
      <Switch>
        <Route path="/ownLicence" component={ownLicence} />
      </Switch>
      <Switch>
        <Route path="/SmartSwapLicence" component={SmartSwapLicence} />
      </Switch>
      <Switch>
        <Route path="/projects" component={Projects} />
      </Switch>
     {/*  <Switch>
        <Route path="/extension" component={Extension} />
      </Switch> */}
      <Switch>
        <Route path="/freelisting" component={FreeListing} />
      </Switch>
      <Switch>
        <Route path="/welcome" component={Welcome} />
      </Switch>
      <Switch>
        <Route path="/smart-extension" component={SmartExtension} />
      </Switch>
      <Switch>
        <Route path="/smart-bridge" component={SmartBridge} />
      </Switch>
      {/* <Switch>
        <Route path="/smart-payment" component={SmartPayment} />
      </Switch> */}
    </DefaultLayout>
    
  </Router>
)

export default DefaultRouter;