import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Dome from './Dome1';
import Dome2 from './Dome2';
import Dome3 from './Dome3';

// import render from './myReact.js';
import './index.css';

function App() {
  // const [state, setState] = Didact.useState(1)
  const [key, setKey] = useState('dome');
  const list = [
    {
      key: 'dome',
      label: 'dome',
      value: <Dome />,
    },
    {
      key: 'dome2',
      label: 'dome2',
      value: <Dome2 />,
    },
    {
      key: 'dome3',
      label: 'dome3',
      value: <Dome3 />,
    },
  ];

  return (
    <>
      {list.map(item => (
        <>
          {
            <button
              onClick={() => {
                setKey(item.key);
              }}
            >
              {item.label}
            </button>
          }
        </>
      ))}

      {list.map(item => (
        <>{item.key === key ? item.value : null}</>
      ))}
    </>
  );
}
// render(<App />, document.getElementById('root'));
ReactDOM.render(<App />, document.getElementById('root'));
