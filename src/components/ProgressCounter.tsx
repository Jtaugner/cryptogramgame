import React, { useEffect, useRef, useState } from 'react'
import Counter from './Counter/Counter'

interface ProgressCounterProps {
  previousTarget: number
  target: number // конечное значение (например, 5)
  total: number  // общее количество (например, 10)
  addPreviousIQ: () => void
  playSound: (soundName: string) => void
}

export const makePlacesForCounter = (value: number) => {
     if(value < 10) return [1];
     if(value < 100) return [10, 1];
     if(value < 1000) return [100, 10, 1];
     return [1000, 100, 10, 1];
}


const ProgressCounter: React.FC<ProgressCounterProps> = ({ previousTarget, target,
      total, addPreviousIQ, playSound }) => {
  const [current, setCurrent] = useState(previousTarget)
  const [taskFinished, setTaskFinished] = useState(previousTarget >= total)
  const [showDoneTask, setShowDoneTask] = useState(previousTarget >= total)
  const isFirstRender = useRef(true)

  useEffect(() => {
     let interval: number;

     if (current < target) {
          let intervalTime = 400;
          if(current < target - 10){
               intervalTime = 100;
          }
          interval = setInterval(() => {
               setCurrent((prev) => {
                    if (prev < target) {
                         return prev + 1
                    } else {
                         
                         clearInterval(interval)
                         return prev
                    }
               })
          }, intervalTime) // скорость роста (меньше — быстрее)
     }

     return () => clearInterval(interval)
  }, [target])
  useEffect(() => {
     if(current === total && previousTarget !== current && previousTarget !== total){
          //Показываем галочку и увеличиваем IQ
          setTaskFinished(true);
          if(isFirstRender.current){
               isFirstRender.current = false;
          }
          setTimeout(() => {
               // playSound('getIQ');
               setTimeout(() => {
                    addPreviousIQ();
               }, 150)
          }, 1400)
     }
  }, [current])

  return (
    <div className={`menu-daily-value
          ${current < total ? 'menu-daily-value-red' : ''}
          ${taskFinished ? 'menu-daily-value_finished' : ''}
    `}
    >
          {
               !showDoneTask && (
                    <span
                    className="menu-daily-value-text"
                    onAnimationEnd={() => {
                         setShowDoneTask(true)
                    }}
               >
                    <Counter
                                   value={current}
                                   fontSize={20}
                                   places={makePlacesForCounter(current)}
                                   gap={4}
                                   borderRadius={0}
                                   
                              /> / {total}
               </span>
               )
          }

          {
               showDoneTask && (
                    <div className={`menu-daily-value-done ${!isFirstRender.current ? 'menu-daily-value-done_new' : ''}`}></div>
               )
          }
    </div>
  )
}

export default ProgressCounter
