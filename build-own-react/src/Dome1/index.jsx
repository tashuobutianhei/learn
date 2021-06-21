import React, { useState, useEffect, useCallback, useMemo } from 'react';
// 基本dome
const Dome1 = () => {
    const [num, setNum] = useState(1);

    useEffect(() => {
      console.log(num)
    }, [])

    useEffect(() => {
      console.log(num)
    }, [num])

    return <div onClick={() => {
        setNum(num => num + 1);
        setNum(num => num + 2);
    }}>{num}</div>
}

export default Dome1;
