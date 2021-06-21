import React, { useRef, useCallback, useEffect, useState } from "react";
import { unstable_batchedUpdates } from 'react-dom'

const Dome4 = () => {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  function add() {
    setTimeout(() => {
      unstable_batchedUpdates(() => {
        console.log('执行4');
        setA(a => a+1);
        console.log('执行5');
        setB(b => b+1);
        console.log('执行6');
      })
    }, 1000);
    console.log('执行1');
    setA(a + 1);
    console.log('执行2');
    setB(b+ 1);
    console.log('执行3');
  }

  console.log('触发');

  return (<div>
    <button onClick={add}>add</button>
    <p>{a}</p>
    <p>{b}</p>
  </div>)
};

export default Dome4;
