import React, { useRef, useCallback, useEffect, useState } from "react";
import { unstable_batchedUpdates } from 'react-dom'

const get = () => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res('data');
    }, 2000);
  })
}

const App = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  
  // const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //         const resData = await get();
  //         setLoading(false);
  //         console.log(resData)
  //         setData(resData);
  //     } catch(err) {
  //         setLoading(false);
  //         // xxxxx
  //     }
  // };

  const fetchData = async () => {
   setLoading(true);
   setTimeout(() => {
    setLoading(false);
    setData('data');
   }, 2000)
};
  
  useEffect(() => {
      fetchData();
  }, []);
  
  // 表单 initValue 只在第一次渲染时有用
  return <div>
    fetch data
    {
      loading ? <div>loading</div> : <div>{data}</div> 
    }
  </div>
};

export default App;
