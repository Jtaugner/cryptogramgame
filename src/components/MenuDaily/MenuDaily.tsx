import React, { useEffect, useRef, useState } from 'react'
import './MenuDaily.css'
import { t } from 'i18next';
import {isScreenMode, getCurrentDateFormatted, params} from '../../main'
import { useAutoFontSizeByHeight } from '../useAutoFontSizeByHeight'
import ProgressCounter from '../ProgressCounter'
import Timer from '../TImer'
import ClickParticles from '../ClickParticles'
import Lottie from 'react-lottie-player'
import animationPunch1 from '../../Hi/Punch00.json'
import animationPunch2 from '../../Hi/Punch01.json'
import animationPunch3 from '../../Hi/Punch03.json'
import animationPunch4 from '../../Hi/Punch_React00.json'
import animationPunch5 from '../../Hi/Punch_React01.json'
import animationPunch6 from '../../Hi/Punch_React03.json'
import animationPunch7 from '../../Hi/Fall.json'
import { UserDataProps } from '../../App';
import { TaskObjectProps } from '../../App';
import { copyObject} from '../../tasks'

const getIQcolor = (iq: number) => {
     if (iq <= 10) return '#e28f2e';
     if (iq <= 20) return '#fba641';
     if (iq <= 40) return '#fbde41';
     if (iq <= 60) return '#ffea79';
     if (iq <= 80) return '#f6ff79';
     if (iq <= 120) return '#cbff79';
     if (iq <= 150) return '#abff79';
     if (iq <= 200) return '#34ce00';
     if (iq <= 350) return '#93ffee';
     if (iq <= 500) return '#20ffdc';
     if (iq <= 700) return '#e9a2ff';
     return '#ff7ceb';
}

let countOfPunch = 0;
let countsOfPunch = [
     25,
     50,
     75,
     100
]
let broccoKilled = false;

interface MenuDailyProps {
     userData: UserDataProps,
     setUserData: (userData: UserDataProps) => void,
     isFirstRender: React.RefObject<boolean>,
     previousIQ: number,
     addPreviousIQ: () => void,
     previousTasksData: TaskObjectProps,
     playSound: (soundName: string) => void,
     addPreviousIQWrapper: () => void,
     testTasks: (taskObject: any, iq: number) => any,
     getCoinFromBrocco: () => void,
     setPreviousTasksData: (previousTasksData: TaskObjectProps) => void,
     setTaskObjectBefore: (taskObject: TaskObjectProps) => void,
}

const MenuDaily: React.FC<MenuDailyProps> = ({
     userData, setUserData, isFirstRender, previousIQ, addPreviousIQ, previousTasksData, playSound,
     addPreviousIQWrapper, testTasks, getCoinFromBrocco, setPreviousTasksData, setTaskObjectBefore
}) => {
     const lottieRef = useRef();
     const broccoliCanvasRef = useRef<{ handleClick: () => void}>(null)
     const [animationData, setAnimationData] = useState<any>(animationPunch1)
     const menuDailyBottomRef = useAutoFontSizeByHeight<HTMLDivElement>();

     const resetLottie = () => {
          try{
               console.log('reset lottie');
               if(countsOfPunch.includes(countOfPunch)){
                    if(lottieRef.current){
                         console.log('play lottie');
                         lottieRef.current.play();
                    }
               }

          }catch(e){

          }

     }
     const playLottie = () => {
          try{
               if(countsOfPunch.includes(countOfPunch)){
                    return;
               }
               if(broccoKilled || countOfPunch >= countsOfPunch[3]){
                    return;
               }
               broccoliCanvasRef.current?.handleClick();
               if(lottieRef.current){
                    lottieRef.current.stop();
                    lottieRef.current.play();
                    countOfPunch++;
               }
               setTimeout(() => {
                    if(broccoKilled){
                         return;
                    }
                    if(countOfPunch === 5 || countOfPunch === countsOfPunch[0] + 5 || countOfPunch === countsOfPunch[1] + 5){
                         setAnimationData(animationPunch2);
                    }
                    if(countOfPunch === 15 || countOfPunch === countsOfPunch[0] + 15 || countOfPunch === countsOfPunch[1] + 15){
                         setAnimationData(animationPunch3);
                    }
                    if(countOfPunch === countsOfPunch[0]){
                         setAnimationData(animationPunch4);
                    }
                    if(countOfPunch === countsOfPunch[1]){
                         setAnimationData(animationPunch5);
                    }
                    if(countOfPunch === countsOfPunch[2]){
                         setAnimationData(animationPunch6);
                    }
                    if(countOfPunch === countsOfPunch[3]){
                         setAnimationData(animationPunch7);
                         broccoKilled = true;
                         if(userData.broccoliKilled !== getCurrentDateFormatted()){
                              params({'broccoliKilled': 1});
                              getCoinFromBrocco();
                         }
                    }
               }, 200);
          }catch(e){
               console.log('error', e);
          }
     }
     const stopLottie = () => {
          try{
               if(countOfPunch === countsOfPunch[3]){
                    return;
               }
               if(lottieRef.current){
                    lottieRef.current.stop();
               }
               if(countsOfPunch.includes(countOfPunch)){
                    countOfPunch++;
                    setAnimationData(animationPunch1);
               }
          }catch(e){
               console.log('error', e);
          }
     }
     const getNewTasks = () => {
          let newTaskObject = testTasks(userData.taskObject, userData.statistics.iq);
          if(newTaskObject){
               setUserData({
                    ...userData,
                    taskObject: copyObject(newTaskObject)
               });
               setPreviousTasksData(copyObject(newTaskObject));
               setTaskObjectBefore(copyObject(newTaskObject));
          }
     }

     useEffect(() => {
          countOfPunch = 0;
          broccoKilled = false;
     }, []);
     
  return (
     <div className="menu-daily">
          <div className="menu-daily-title-block">
               <span
               className="menu-daily-title"
               onClick={() => {
                         if(isScreenMode){
                              setUserData({
                                   ...userData,
                                   lastLevel: userData.lastLevel + 1
                              });
                         }
               }}
               >
                    {t('tasks')}
               </span>
               <span className="menu-daily-iq">IQ 
                    <span
                         className={`
                              menu-daily-iq-number
                              ${!isFirstRender.current ? 'menu-daily-iq-number_new' : ''}`}
                         style={{
                              color: getIQcolor(previousIQ),
                              width: 15 * String(previousIQ).length + 'px'
                         }}
                         key={'previousIQ_' + previousIQ}
                         onClick={() => {
                              if(isScreenMode){
                                   addPreviousIQ();
                                   setUserData({
                                        ...userData,
                                        statistics: {
                                             ...userData.statistics,
                                             iq: userData.statistics.iq + 1
                                        }
                                   });
                              }
                         }}
                    >
                         {previousIQ}
                    </span>
               </span>
          </div>
          <div className="menu-daily-row-block">
               <div className="menu-daily-row-block-left">
                    {
                         userData.taskObject &&
                         Object.keys(userData.taskObject.tasks).map((task, index) => {
                              const ref = useAutoFontSizeByHeight<HTMLDivElement>();
                              return (
                              <div
                              className="menu-daily-row" key={'task_' + index}
                              ref={ref}
                              >
                                   <span
                                   className="menu-daily-label"
                                   >
                                        {t('task-' +task)}
                                   </span>
                                   <ProgressCounter
                                        key={'task_' + task + '_' + previousTasksData?.tasks[task].now + '_' + userData.taskObject?.tasks[task].now}
                                        previousTarget={previousTasksData?.tasks[task].now || 0}
                                        target={userData.taskObject?.tasks[task].now || 0}
                                        total={userData.taskObject?.tasks[task].goal || 0}
                                        addPreviousIQ={addPreviousIQWrapper}
                                        playSound={playSound}
                                   />
                              </div>
                         )})
                    }
               </div>
               
               <div className="menu-daily-broccoli" onClick={playLottie}>
                    <ClickParticles
                    ref={broccoliCanvasRef}
                    />
                    <Lottie
                         play={false}
                         loop={countOfPunch === countsOfPunch[3] ? true : false}
                         ref={lottieRef}
                         animationData={animationData}
                         onComplete={stopLottie}
                         onLoad={resetLottie}
                         
                    />
               </div>
          </div>
          <div className="menu-daily-bottom" ref={menuDailyBottomRef}>
               <div>
                    {
                         userData.taskObject &&
                         userData.taskObject.dateToGetNewTask > 0 ?
                         t('untillNextTask') : 
                         t('dailyTasks')
                    }

               </div>
               <div className="flex items-center">
                    {
                         userData.taskObject &&
                         userData.taskObject.dateToGetNewTask > 0 ?
                         <>
                              <div className="menu-daily-time-timer"></div>
                              <Timer
                              startTime={userData.taskObject.dateToGetNewTask}
                              time={userData.taskObject.time}
                              getNewTasks={getNewTasks}
                              />
                         </> :
                         <>
                              <span className="menu-daily-iq">IQ  
                                   <span className="" style={{color: getIQcolor(previousIQ)}}>
                                        {' ' + previousIQ}
                                   </span>
                              </span>
                              <span className="menu-daily-arrow"></span>
                              <span className="menu-daily-iq menu-daily-nextiq">IQ 
                                   <span className="" style={{color: getIQcolor(previousIQ + 1)}}>
                                        {' ' + (previousIQ + 1)}
                                   </span>
                              </span>
                         </> 
                    }

               </div>
          </div>
     
     </div>
  )
}

export default MenuDaily
