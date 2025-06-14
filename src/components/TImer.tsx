import React, { useEffect, useRef, useState } from 'react'
import { getServerTime } from '../main'

interface ProgressCounterProps {
  startTime: number,
  time: number,
  getNewTasks: () => void
}

const msToTime = (ms: number) => {
     const totalSeconds = Math.floor(ms / 1000)
     const hours = Math.floor(totalSeconds / 3600)
     const minutes = Math.floor((totalSeconds % 3600) / 60)
     const seconds = totalSeconds % 60
   
     const pad = (n: number) => (n < 10 ? '0' + n : '' + n)
   
     return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function getTime(startTime: number, time: number) {
     let now = getServerTime();
     let diff = (startTime + time) - now;
     if(diff < 0) return 0;
     return diff;
}

const Timer: React.FC<ProgressCounterProps> = ({startTime, time, getNewTasks}) => {
     const [currentTime, setCurrentTime] = useState(getTime(startTime, time));
     useEffect(() => {
       const interval = setInterval(() => {
          let current = getTime(startTime, time);
          setCurrentTime(current);
          if(current === 0){
               getNewTasks();
          }
       }, 1000);
   
       return () => clearInterval(interval); // очистка при размонтировании
     }, []);
  return (
     <span className="menu-daily-time">
          {msToTime(currentTime)}
     </span>
  )
}

export default Timer
