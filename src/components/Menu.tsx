import React, { useEffect, useRef, useState } from 'react'
import './Menu.css'
import Statistics from './modalComponents/Statistics'
import { TaskObjectProps, UserDataProps } from '../App'
import Settings from './modalComponents/Settings/Settings'
import Rating from './modalComponents/Rating'
import Collection from './modalComponents/Collection'
import { LevelData, levels, msToTime } from '../levels'
import { copyObject} from '../tasks'
import { getMinutesFromSeconds } from '../tasks'
import { NOT_SHOW_ADV, showAdv, isPurchaseAvailable, params, getCurrentDateFormatted, isScreenMode } from '../main'
import { useTranslation } from 'react-i18next'
import Modes from './Modes/Modes'
import { useBackButtonClick } from '../hooks/useBackButtonClick'
import { addUserToRating, openRating } from '../mobile-sdk'
import { getFlyingCoin } from '../flyingCoin'
import { useAutoFontSizeByHeight } from './useAutoFontSizeByHeight'
import MenuDaily from './MenuDaily/MenuDaily'
import { useAutoFontSizeWithNearElement } from './hooks/useAutoFontSizeWithNearElement'





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
  openCalendar: () => void
  setCoinAnimation: (coinAnimation: boolean) => void
}

let taskObjectBefore: TaskObjectProps = null;
let dailyAdded = false;

const Menu: React.FC<MenuProps> = ({ onStart, userData, setUserData, getGameSeconds,
      previousTasksData, setPreviousTasksData, previousIQ, addPreviousIQ,
       copyFunction, testTasks, showShop, showShopMoney, setShowShop,
       openShopMoney, playSound, gameLanguage, setGameLocation, dailyDone, setDailyDone, openCalendar, setCoinAnimation }) => {

     const { t } = useTranslation();


     const [showStats, setShowStats] = useState(false)
     const [showSettings, setShowSettings] = useState(false)
     const [showRating, setShowRating] = useState(false)
     const [showCollection, setShowCollection] = useState(false)
     const [dailyAnimation, setDailyAnimation] = useState(false)
     const continueBtnRef = useAutoFontSizeWithNearElement<HTMLDivElement>(
          {
               blockSelector: '.menu-continue-btn-category',
               minGapPx: 5
          }
     );
     
     const isFirstRender = useRef(true)
     const timeoutIds = useRef<number[]>([]);

     const addPreviousIQWrapper = () => {
          if(isFirstRender.current){
               isFirstRender.current = false;
          }
          addPreviousIQ();
     }
     const backButtonClick = () => {
          setShowStats(false);
          setShowSettings(false);
          setShowRating(false);
          setShowCollection(false);
     };
     useBackButtonClick(backButtonClick);
     


     const addCoin = () => {
          setUserData({
               ...userData,
               money: userData.money + 1,
               broccoliKilled: getCurrentDateFormatted()
          });
     }

     const setTaskObjectBefore = (taskObject: TaskObjectProps) => {
          taskObjectBefore = taskObject;
     }

     const getCoinFromBrocco = () => {
          console.log('getCoinFromBrocco');
          getFlyingCoin();
          setCoinAnimation(true);
          timeoutIds.current.push(setTimeout(() => {
               setCoinAnimation(false);
          }, 1500));
          timeoutIds.current.push(setTimeout(() => {
               playSound('addMoney');
               addCoin();
          }, 600));
     }
     
     const startGame = () => {

          if(__PLATFORM__ === 'gd'){
               showAdv();
          }
          if(levels[userData.lastLevel]){
               setPreviousTasksData(copyObject(taskObjectBefore));
               onStart();
          }
     }


     const openDailyLevel = () => {
          setGameLocation('dailyLevel');
          onStart();
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
          return () => {
               timeoutIds.current.forEach(id => clearTimeout(id));
          }
     }, []);


     return (
     <div className="menu-bg">
          {/* Настройки */}
          <div className="menu__top">
               <div className="menu-settings-btn extended-click" onClick={() => setShowSettings(true)}></div>

               <div className={`noAds ${!isPurchaseAvailable ? 'notShowAds' : ''}`} onClick={openShopMoney}
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
          <Modes
             openDailyLevel={openDailyLevel}
             userData={userData}
             setUserData={setUserData}
             dailyAnimation={dailyAnimation}
             openCalendar={openCalendar}
              
          />
          <MenuDaily
               userData={userData}
               setUserData={setUserData}
               isFirstRender={isFirstRender}
               previousIQ={previousIQ}
               addPreviousIQ={addPreviousIQ}
               previousTasksData={previousTasksData}
               playSound={playSound}
               addPreviousIQWrapper={addPreviousIQWrapper}
               testTasks={testTasks}
               getCoinFromBrocco={getCoinFromBrocco}
               setPreviousTasksData={setPreviousTasksData}
               setTaskObjectBefore={setTaskObjectBefore}
          />
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
                              <span className="menu-continue-btn-label" ref={continueBtnRef}>{t('continue')}</span>
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
               <div className={`menu-bottom-wrap ${__PLATFORM__ === 'yt' ? 'menu-bottom-wrap__noRating' : ''}`}>
                    <div className="menu-bottom-icon icon-shop" onClick={() => setShowShop(true)}>
                         <span className="menu-bottom-label">{t('shop')}</span>
                    </div>
                    <div className={`menu-bottom-icon icon-rating ${__PLATFORM__ === 'gd' ? 'blockHidden' : ''}
                    
                    ${__PLATFORM__ === 'yt' ? 'notShowRating' : ''}
                    `}
                     onClick={() => {
                         if(__PLATFORM__ === 'mobile'){
                              addUserToRating(userData.statistics.iq);
                              openRating();
                         }else{
                              setShowRating(true);
                         }
                     }}>
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