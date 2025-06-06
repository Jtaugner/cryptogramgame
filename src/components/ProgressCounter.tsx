import React, { useEffect, useRef, useState } from 'react'

interface ProgressCounterProps {
  previousTarget: number
  target: number // конечное значение (например, 5)
  total: number  // общее количество (например, 10)
  addPreviousIQ: () => void
}

const ProgressCounter: React.FC<ProgressCounterProps> = ({ previousTarget, target, total, addPreviousIQ }) => {
  const [current, setCurrent] = useState(previousTarget)
  const [taskFinished, setTaskFinished] = useState(previousTarget === total)
  const [showDoneTask, setShowDoneTask] = useState(previousTarget === total)
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
               addPreviousIQ();
          }, 1600)
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
                    {current} / {total}
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
