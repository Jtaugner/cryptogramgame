import React, { useEffect, useRef, useState, FC } from 'react'

// Хук для отслеживания времени активности страницы
export function usePageActiveTimer() {
  const [activeTime, setActiveTime] = useState(0) // накопленное время в мс
  const startTimestamp = useRef<number | null>(null)

  // Начать отсчет
  const start = () => {
    console.log('start');
    if (startTimestamp.current === null) {
      startTimestamp.current = Date.now()
    }
  }

  // Остановить и накопить время
  const stop = () => {
    if (startTimestamp.current !== null) {
      setActiveTime(prev => {
          if(startTimestamp.current){
            return prev + (Date.now() - startTimestamp.current)
          }else{
            return prev
          }
     })
      startTimestamp.current = null
    }
  }

  // Сбросить таймер
  const reset = (time?: number) => {
    setActiveTime(time ? time : 0)
    if (document.visibilityState === 'visible') {
      startTimestamp.current = Date.now()
    } else {
      startTimestamp.current = null
    }
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        start()
      } else {
        stop()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    // Запустить при монтировании, если страница видима
    if (document.visibilityState === 'visible') start()

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Функция для получения секунд по запросу
  const getSeconds = (doReset: boolean = true) => {
    const currentInterval = startTimestamp.current !== null ? Date.now() - startTimestamp.current : 0
    const totalMs = activeTime + currentInterval
    //Время в секундах;
    let time = Math.floor(totalMs / 1000);
    if(doReset) reset(time - (Math.floor(time/60)*60));
    return time;
  }

  return { getSeconds, reset }
}