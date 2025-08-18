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
import { copyObject,  } from '../tasks'
import { getMinutesFromSeconds } from '../tasks'
import ProgressCounter from './ProgressCounter'
import Timer from './TImer'
import ClickParticles from './ClickParticles'
import { NOT_SHOW_ADV } from '../main'
import { useTranslation } from 'react-i18next'
import Modes from './Modes/Modes'





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
  openShopMoney: () => void
  playSound: (soundName: string) => void
  gameLanguage: string
  setGameLocation: (gameLocation: string) => void
  dailyDone: boolean
  setDailyDone: (dailyDone: boolean) => void
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
let dailyAdded = false;

const Menu: React.FC<MenuProps> = ({ onStart, userData, setUserData, getGameSeconds,
      previousTasksData, setPreviousTasksData, previousIQ, addPreviousIQ,
       copyFunction, testTasks, showShop, showShopMoney, setShowShop,
       openShopMoney, playSound, gameLanguage, setGameLocation, dailyDone, setDailyDone }) => {

     const { t } = useTranslation();


     const [showStats, setShowStats] = useState(false)
     const [showSettings, setShowSettings] = useState(false)
     const [showRating, setShowRating] = useState(false)
     const [animationData, setAnimationData] = useState<any>(animationPunch1)
     const [showCollection, setShowCollection] = useState(false)
     const [dailyAnimation, setDailyAnimation] = useState(false)
     
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

     const openDailyLevel = () => {
          setGameLocation('dailyLevel');
          startGame();
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
          setGameLocation('main');

          if(dailyDone){
               setDailyDone(false);
               if(!dailyAdded){
                    dailyAdded = true;
                    setTimeout(() => {
                         addPreviousIQ();
                         setDailyAnimation(true);
                    }, 200);
               }
               
          }
     }, []);


     return (
     <div className="menu-bg">
          {/* Настройки */}
          <div className="menu__top">
               <div className="menu-settings-btn" onClick={() => setShowSettings(true)}></div>

               <div className="noAds" onClick={openShopMoney}
                    style={{
                         opacity: NOT_SHOW_ADV ? 0 : 1
                    }}
                    >
                    <div className="noAds_text">ADS</div>
                    <label className="switch">
                         <input type="checkbox" defaultChecked={true}/>
                         <span className="slider">
                              <span className="label on">{t('on')}</span>
                              <span className="circle"></span>
                         </span>
                    </label>
               </div>
          </div>
          {/* Карточки режимов */}

          {/* Дневной результат */}
          <div className="menu__centerBlock">
          {gameLanguage === 'ru' &&
               <Modes openDailyLevel={openDailyLevel} userData={userData} setUserData={setUserData} dailyAnimation={dailyAnimation}/>
          }
          <div className="menu-daily">
          <div className="menu-daily-title-block">
               <span className="menu-daily-title">{t('tasks')}</span>
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
                              <span>{t('continue')}</span>
                              <span className="menu-continue-btn__level">{t('level')} {userData.lastLevel+1}</span>
                              </> :
                              <>
                              <span>{t('noLevels')}</span>
                              <span className="menu-continue-btn__level">{t('levelsWillAppear')}</span>
                              </>
                              
                         }
                         
                    </div>
               </div>
          </div>
          
          {/* Нижнее меню */}
          <div className="menu-bottom">
               <div className="menu-bottom-wrap">
                    <div className="menu-bottom-icon icon-shop" onClick={() => setShowShop(true)}>
                         <span className="menu-bottom-label">{t('shop')}</span>
                    </div>
                    <div className="menu-bottom-icon icon-rating" onClick={() => setShowRating(true)}>
                         <span className="menu-bottom-label">{t('rating')}</span>
                    </div>
                    <div className="menu-bottom-icon icon-stat" onClick={() => setShowStats(true)}>
                         <span className="menu-bottom-label">{t('statistics')}</span>
                    </div>
                    <div className="menu-bottom-icon icon-collection" onClick={() => setShowCollection(true)}>
                         <span className="menu-bottom-label">{t('collection')}</span>
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
                    gameLanguage={gameLanguage}
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