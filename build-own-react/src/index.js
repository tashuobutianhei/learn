import React from 'react';
import ReactDOM from 'react-dom';
import Dome from './Dome1';
import Dome2 from './Dome2';

// import render from './myReact.js';
import './index.css';

function App() {
  // const [state, setState] = Didact.useState(1)
  return (
    <><Dome2></Dome2></>
  )
}
// render(<App />, document.getElementById('root'));
ReactDOM.render(<App />, document.getElementById('root'));
