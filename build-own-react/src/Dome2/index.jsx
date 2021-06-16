import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
// 前一次的值
const Dome2 = () => {
  const [count, setCount] = useState(0);

  const prevCountRef = useRef();
  
  useEffect(() => {
    prevCountRef.current = count;
  });
  const prevCount = prevCountRef.current;


  return <div>
    <h1>Now: {count}, before: {prevCount}</h1>
    <button onClick={() => {
      setCount(val => val + 1)
    }}>+1</button>
  </div>;
}

export default Dome2;
