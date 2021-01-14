import './App.css';
import {BrowserRouter,Route,Switch} from 'react-router-dom'
import Global from './Global.js'
import LoginPage from './LoginPage.js';
import User from './User.js'
import Profile from './Profile.js'

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path = '/login'>
          <LoginPage/>
        </Route>
        <Route exact path='/'>
          <Global/>
        </Route>
        <Route path='/global'>
            <Global/>
        </Route>
        <Route exact path='/user'>
          <User/>
        </Route>
        <Route exact path='/userProfile/:uIdent'component={Profile}></Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
