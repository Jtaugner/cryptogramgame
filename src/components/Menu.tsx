import React, { useEffect, useRef, useState } from 'react'
import './Menu.css'
import Lottie from 'react-lottie-player'
import animationPunch1 from '../Hi/Punch00.json'
import animationPunch2 from '../Hi/Punch01.json'
import animationPunch3 from '../Hi/Punch03.json'
import animationPunch4 from '../Hi/Punch_React00.json'
import animationPunch5 from '../Hi/Punch_React01.json'
import animationPunch6 from '../Hi/Punch_React03.json'
import animationPunch7 from '../Hi/Fall.json'
import Statistics from './modalComponents/Statistics'
import { TaskObjectProps, UserDataProps } from '../App'
import Settings from './modalComponents/Settings'
import Shop from './modalComponents/Shop'
import ShopMoney from './modalComponents/ShopMoney'
import Rating from './modalComponents/Rating'
import Collection from './modalComponents/Collection'
import { LevelData, levels, msToTime } from '../levels'
import { copyObject, getTaskName } from '../tasks'
import { getMinutesFromSeconds } from '../tasks'
import ProgressCounter from './ProgressCounter'
import Timer from './TImer'
import ClickParticles from './ClickParticles'
import { NOT_SHOW_ADV } from '../main'





interface MenuProps {
  onStart: () => void
  userData: UserDataProps
  setUserData: (userData: UserDataProps) => void
  getGameSeconds: () => number
  previousTasksData: TaskObjectProps
  setPreviousTasksData: (previousTasksData: TaskObjectProps) => void
  previousIQ: number
  addPreviousIQ: () => void
  copyFunction: (levelData: LevelData) => void,
  testTasks: (taskObject: any, iq: number) => any,
  showShop: boolean
  showShopMoney: boolean
  setShowShop: (showShop: boolean) => void
  setShowShopMoney: (showShopMoney: boolean) => void
  playSound: (soundName: string) => void
}
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

let taskObjectBefore: TaskObjectProps = null;

const Menu: React.FC<MenuProps> = ({ onStart, userData, setUserData, getGameSeconds,
      previousTasksData, setPreviousTasksData, previousIQ, addPreviousIQ,
       copyFunction, testTasks, showShop, showShopMoney, setShowShop,
        setShowShopMoney, playSound }) => {


     const [showStats, setShowStats] = useState(false)
     const [showSettings, setShowSettings] = useState(false)
     const [showRating, setShowRating] = useState(false)
     const [animationData, setAnimationData] = useState<any>(animationPunch1)
     const [showCollection, setShowCollection] = useState(false)
     
     const lottieRef = useRef();
     const isFirstRender = useRef(true)
     const broccoliCanvasRef = useRef<{ handleClick: () => void}>(null)

     const addPreviousIQWrapper = () => {
          if(isFirstRender.current){
               isFirstRender.current = false;
          }
          addPreviousIQ();
     }

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
               broccoliCanvasRef.current?.handleClick();
               if(lottieRef.current){
                    lottieRef.current.stop();
                    lottieRef.current.play();
                    countOfPunch++;
               }
               setTimeout(() => {
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
                    }
               }, 200)
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
     const startGame = () => {
          if(levels[userData.lastLevel]){
               setPreviousTasksData(copyObject(taskObjectBefore));
               onStart();
          }
          console.log('play music');
          // playSound('music');
     }

     const getNewTasks = () => {
          let newTaskObject = testTasks(userData.taskObject, userData.statistics.iq);
          if(newTaskObject){
               setUserData({
                    ...userData,
                    taskObject: copyObject(newTaskObject)
               });
               setPreviousTasksData(copyObject(newTaskObject));
               taskObjectBefore = copyObject(newTaskObject);
          }
     }

     
     useEffect(() => {
          const taskObject = userData.taskObject;
          if(taskObject && taskObject.tasks['time']){
               let time = taskObject.tasks['time'].now
                + getMinutesFromSeconds(getGameSeconds());
               console.log('time', time, taskObject.tasks['time'].goal);
               if(!taskObject.tasks['time'].taskCompleted){
                    let addIQ = 0;
                    if(time >= taskObject.tasks['time'].goal){
                         addIQ = 1;
                         taskObject.tasks['time'].now = taskObject.tasks['time'].goal;
                         taskObject.tasks['time'].taskCompleted = true;
                    }else{
                         taskObject.tasks['time'].now = time;
                    }
                    setUserData(
                         {...userData,
                         statistics: {
                              ...userData.statistics,
                               iq: userData.statistics.iq + addIQ
                         },
                         taskObject: testTasks(taskObject, userData.statistics.iq)
                         }
                    );
               }
          }

          if(taskObject){
               taskObjectBefore = testTasks(taskObject, userData.statistics.iq);
          }else{
               taskObjectBefore = testTasks(previousTasksData, userData.statistics.iq);
          }
          countOfPunch = 0;
     }, []);


     return (
     <div className="menu-bg">
          {/* Настройки */}
          <div className="menu__top">
               <div className="menu-settings-btn" onClick={() => setShowSettings(true)}></div>
               <div
                className={`moneyCount ${showShop || showShopMoney ? 'moneyCount_big' : ''}`}
                onClick={() => setShowShopMoney(true)}
                >
                    <div className="modal-shop-row-price-icon">
                    </div>{userData.money}
               </div>
               <div className="noAds" onClick={() => setShowShopMoney(true)}
                    style={{
                         opacity: NOT_SHOW_ADV ? 0 : 1
                    }}
                    >
                    <div className="noAds_text">ADS</div>
                    <label className="switch">
                         <input type="checkbox" defaultChecked={true}/>
                         <span className="slider">
                              <span className="label on">ВКЛ</span>
                              <span className="circle"></span>
                         </span>
                    </label>
               </div>
          </div>
          {/* Карточки режимов */}
          {/* <div className="menu-modes">
          <div className="menu-mode-card">
               <div className="flex justify-between items-center mb-2">
               <span className="menu-mode-title">Игра разума</span>
               <span className="menu-mode-iq">+IQ 1</span>
               </div>
               <div className="menu-mode-progress">
               Прогресс <span className="ml-auto text-red-500 font-bold">0/5</span>
               </div>
               <div onClick={onStart} className="menu-mode-play">ИГРАТЬ</div>
          </div>
          <div className="menu-mode-card locked">
               <div className="flex justify-between items-center mb-2">
               <span className="menu-mode-title">Криптологика</span>
               <span className="menu-mode-iq">+IQ 1</span>
               </div>
               <div className="flex flex-col items-center justify-center h-12">
               <svg width="32" height="32" fill="none" stroke="#3b3e7e" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
               <span className="text-xs text-[#3b3e7e] mt-1">Пройти уровней 0/19</span>
               </div>
               <div disabled className="menu-mode-play">ИГРАТЬ</div>
               <div className="absolute inset-0 flex items-center justify-center">
               <svg width="40" height="40" fill="none" stroke="#3b3e7e" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>
               </div>
          </div>
          </div> */}
          {/* Дневной результат */}
          <div className="menu__centerBlock">
          <div className="menu-daily">
          <div className="menu-daily-title-block">
               <span className="menu-daily-title">ЗАДАНИЯ</span>
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
                     >
                          {previousIQ}
                     </span>
               </span>
          </div>
          <div className="menu-daily-row-block">
               <div className="menu-daily-row-block-left">
                    {
                         userData.taskObject &&
                          Object.keys(userData.taskObject.tasks).map((task, index) => (
                              <div className="menu-daily-row" key={'task_' + index}>
                                   <span className="menu-daily-label">
                                        {getTaskName(task)}
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
                         ))
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
          <div className="menu-daily-bottom">
               <div>
                    {
                         userData.taskObject &&
                         userData.taskObject.dateToGetNewTask > 0 ?
                         'До следующего задания:' : 
                         'Выполняйте ежедневные задания:'
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
          {/* Продолжить */}
               <div className="menu-continue">
                    <div className={`menu-continue-btn shiny-button ${!levels[userData.lastLevel] ? 'menu-continue-btn_disabled' : ''}`} onClick={startGame}>
                         {
                              levels[userData.lastLevel] ?
                              <>
                              <div
                               className={`menu-continue-btn-category
                                ${'menu-continue-btn-category_' + levels[userData.lastLevel].type}`}>
                              </div>       
                              <span>ПРОДОЛЖИТЬ</span>
                              <span className="menu-continue-btn__level">УРОВЕНЬ {userData.lastLevel+1}</span>
                              </> :
                              <>
                              <span>УРОВНЕЙ НЕТ</span>
                              <span className="menu-continue-btn__level">Они скоро появятся</span>
                              </>
                              
                         }
                         
                    </div>
               </div>
          </div>
          
          {/* Нижнее меню */}
          <div className="menu-bottom">
               <div className="menu-bottom-wrap">
                    <div className="menu-bottom-icon icon-shop" onClick={() => setShowShop(true)}>
                         <span className="menu-bottom-label">Магазин</span>
                    </div>
                    <div className="menu-bottom-icon icon-rating" onClick={() => setShowRating(true)}>
                         <span className="menu-bottom-label">Рейтинг</span>
                    </div>
                    <div className="menu-bottom-icon icon-stat" onClick={() => setShowStats(true)}>
                         <span className="menu-bottom-label">Статистика</span>
                    </div>
                    <div className="menu-bottom-icon icon-collection" onClick={() => setShowCollection(true)}>
                         <span className="menu-bottom-label">Коллекция</span>
                    </div>     
               </div>
          
          </div>
          {showStats && (
               <Statistics
                    userData={userData}
                    onClose={() => setShowStats(false)}
               />
          )}
          {showSettings && (
               <Settings
                    userData={userData}
                    onClose={() => setShowSettings(false)}
                    setUserData={setUserData}
               />
          )}
          {showRating && (
               <Rating
                    userData={userData}
                    onClose={() => setShowRating(false)}
               />
          )}
          {showCollection && (
               <Collection
                    userData={userData}
                    onClose={() => setShowCollection(false)}
                    copyFunction={copyFunction}
               />
          )}
     </div>
     )
}

export default Menu 