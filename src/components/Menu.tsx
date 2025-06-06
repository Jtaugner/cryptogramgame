import React, { useEffect, useRef, useState } from 'react'
import './Menu.css'
import Lottie from 'react-lottie-player'
import animationData from '../Hi/Think.json'
import Statistics from './modalComponents/Statistics'
import { TaskObjectProps, UserDataProps } from '../App'
import Settings from './modalComponents/Settings'
import Shop from './modalComponents/Shop'
import ShopMoney from './modalComponents/ShopMoney'
import Rating from './modalComponents/Rating'
import Collection from './modalComponents/Collection'
import { levels } from '../levels'
import { copyObject, getTaskName } from '../tasks'
import { getMinutesFromSeconds } from '../tasks'
import ProgressCounter from './ProgressCounter'

interface MenuProps {
  onStart: () => void
  userData: UserDataProps
  setUserData: (userData: UserDataProps) => void
  getGameSeconds: () => number
  previousTasksData: TaskObjectProps
  setPreviousTasksData: (previousTasksData: TaskObjectProps) => void
  previousIQ: number
  addPreviousIQ: () => void
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

let taskObjectBefore: TaskObjectProps = null;

const Menu: React.FC<MenuProps> = ({ onStart, userData, setUserData, getGameSeconds, previousTasksData, setPreviousTasksData, previousIQ, addPreviousIQ }) => {


     const [showStats, setShowStats] = useState(false)
     const [showSettings, setShowSettings] = useState(false)
     const [showShop, setShowShop] = useState(false)
     const [showShopMoney, setShowShopMoney] = useState(false)
     const [showRating, setShowRating] = useState(false)
     const [showCollection, setShowCollection] = useState(false)
     const lottieRef = useRef();
     const isFirstRender = useRef(true)

     const addPreviousIQWrapper = () => {
          if(isFirstRender.current){
               isFirstRender.current = false;
          }
          addPreviousIQ();
     }
     const startGame = () => {
          console.log('startGame');
          setPreviousTasksData(copyObject(taskObjectBefore));
          onStart();
     }

     
     useEffect(() => {
          const taskObject = userData.taskObject;
          if(taskObject && taskObject.tasks['time']){
               let time = getMinutesFromSeconds(getGameSeconds());
               console.log('settime', time, taskObject.tasks['time'].goal);
               if(!taskObject.tasks['time'].taskCompleted){
                    taskObject.tasks['time'].now = time;
                    let addIQ = 0;
                    if(time >= taskObject.tasks['time'].goal){
                         addIQ = 1;
                         taskObject.tasks['time'].now = taskObject.tasks['time'].goal;
                         taskObject.tasks['time'].taskCompleted = true;
                    }
                    setUserData(
                         {...userData,
                         statistics: {
                              ...userData.statistics,
                               iq: userData.statistics.iq + addIQ
                         },
                         taskObject: taskObject
                         }
                    );
               }
          }
          console.log('previousTasksData', previousTasksData);
          console.log('taskObject', taskObject);
          taskObjectBefore = taskObject;
     }, []);

     useEffect(() => {
          console.log('changeUSERDATA');
     }, [userData]);

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
               <div className="noAds" onClick={() => setShowShopMoney(true)}>
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
               <span className="menu-daily-title">Дневной результат</span>
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
                                        previousTarget={previousTasksData?.tasks[task].now || 0}
                                        target={userData.taskObject?.tasks[task].now || 0}
                                        total={userData.taskObject?.tasks[task].goal || 0}
                                        addPreviousIQ={addPreviousIQWrapper}
                                      />
                              </div>
                         ))
                    }
               </div>
               
               <div className="menu-daily-broccoli">
                    <Lottie
                         play
                         loop
                         ref={lottieRef}
                         // onClick={() => {
                         //      try{
                         //           lottieRef.current?.play();
                         //      }catch(e){}
                         // }}
                         // onLoopComplete={() => {
                         //      console.log('complete')
                         //      try{
                         //           lottieRef.current?.pause();
                         //      }catch(e){}
                         // }}
                         animationData={animationData}
                         
                    />
                    {/* <video
                         className="video-bg"
                         src={broccoli} 
                         autoPlay
                         muted
                         loop
                         playsInline
                    /> */}
               </div>
          </div>
          <div className="menu-daily-bottom">
               <div>Выполняйте ежедневные задания:</div>
               <div className="flex items-center">
                    <span className="menu-daily-iq">IQ 
                          <span className="" style={{color: getIQcolor(previousIQ)}}> {previousIQ}
                         </span>
                    </span>
                    <span className="menu-daily-arrow"></span>
                    <span className="menu-daily-iq menu-daily-nextiq">IQ 
                    <span className="" style={{color: getIQcolor(previousIQ + 1)}}> {previousIQ+ 1}
                         </span>
                    </span>
               </div>
          </div>
          
          </div>
          {/* Продолжить */}
          <div className="menu-continue">
          <div className="menu-continue-btn shiny-button" onClick={startGame}>
               <div className={`menu-continue-btn-category ${'menu-continue-btn-category_' + levels[userData.lastLevel].type}`}></div>       
               <span>ПРОДОЛЖИТЬ</span>
               <span className="menu-continue-btn__level">УРОВЕНЬ {userData.lastLevel+1}</span></div>
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
          {showShop && (
               <Shop
                    userData={userData}
                    onClose={() => setShowShop(false)}
                    openShopMoney={() => setShowShopMoney(true)}
                    setUserData={setUserData}
               />
          )}
          {showShopMoney && (
               <ShopMoney
                    userData={userData}
                    onClose={() => setShowShopMoney(false)}
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
               />
          )}
     </div>
     )
}

export default Menu 