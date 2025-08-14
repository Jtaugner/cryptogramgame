import React, { useEffect, useRef, useState } from 'react'
import './Modes.css'
import { getCurrentDateFormatted, getTimeLeftInDay } from '../../main';
import { t } from 'i18next';
import { UserDataProps } from '../../App';
import { formatSmallTime } from '../../levels';
import { levelToOpenDaily } from '../../levels';

interface ModesProps {
  openDailyLevel: () => void,
  userData: UserDataProps,
  setUserData: (userData: UserDataProps) => void,
  dailyAnimation: boolean
}

function testIsDailyClosed(userData: UserDataProps){
     return userData.locations['dailyLevel'].doneForToday
      && userData.locations['dailyLevel'].currentDate === getCurrentDateFormatted();
}

const Modes: React.FC<ModesProps> = ({openDailyLevel, userData, setUserData, dailyAnimation}) => {
     const [timeLeft, setTimeLeft] = useState(getTimeLeftInDay());
     const [isDailyClosed, setIsDailyClosed] = useState(testIsDailyClosed(userData));
     
     useEffect(() => {
          const interval = setInterval(() => {
               setTimeLeft(getTimeLeftInDay());
               let dailyClosed = testIsDailyClosed(userData);
               if(dailyClosed !== isDailyClosed){
                    setIsDailyClosed(dailyClosed);
               }
          }, 5000);
          return () => clearInterval(interval);
     }, []);
     const openDailyWrapper = () => {
          if(!isDailyClosed && userData.lastLevel >= levelToOpenDaily){
               let loc = 'dailyLevel';
               if(userData.locations[loc].data === null || userData.locations[loc].currentDate !== getCurrentDateFormatted()){
                    setUserData({
                         ...userData,
                         locations: {
                              ...userData.locations,
                              [loc]: {
                                   ...userData.locations[loc],
                                   level: userData.locations[loc].level + 1, 
                                   doneForToday: false,
                                   currentDate: getCurrentDateFormatted()
                              }
                         }
                    })
               }
               openDailyLevel();

          }
     }
  return (
     <div className="menu__modes">
          <div className="menu__mode-card-wrapper">
               <div
                className={`menu__mode-card ${isDailyClosed ? 'menu__mode-card_closed' : ''} ${userData.lastLevel < levelToOpenDaily ? 'menu__mode-card_notAvailable' : ''}`}
                onClick={openDailyWrapper}
                >
                    {userData.lastLevel < levelToOpenDaily &&
                         <>
                              <div className="closedMode"></div>
                              <div className="closedMode__text">
                                   {t('dailyBlocked', {level: levelToOpenDaily+1})}
                              </div>
                         </>
                    }
                    {isDailyClosed && <div className="menu__mode-card_blur"></div>}
                    <div className="menu__mode-card__name">{t('dailyTask')}</div>
                    {
                         isDailyClosed ?
                         <>
                              <div className={`menu-daily-value ${dailyAnimation ? 'doneDailyTaskAnimation' : ''}`}>
                                   <div className={`menu-daily-value-done`}></div>
                              </div>
                              <div className="menu__mode-card__timeUntillNext">
                                   <div className='menu__mode-card__timeUntillNext__text'>
                                        {t('newTask')}:
                                   </div>

                                   <div className='menu__mode-card__timeUntillNext'>
                                        <div className="menu__mode-card__timer"></div>
                                        {timeLeft.hours}{t('hours-mini')} {timeLeft.minutes}{t('minutes-mini')}
                                   </div>
                                   
                              </div>
                         </>
                         :
                         <>
                              <div className="menu__mode-card__iq"
                              style={{
                                   opacity: userData.lastLevel >= levelToOpenDaily ? 1 : 0
                              }}>
                                   + IQ
                                   <div className="menu__mode-card__iq-number"> 1</div>
                              </div>
                              <div className={`menu__mode-card__play ${userData.lastLevel >= levelToOpenDaily ? 'shiny-button shiny-button-anotherTiming' : ''}`}>
                              {t('play')}
                              </div>
                         </>
                    }

               </div>
               {!isDailyClosed && userData.lastLevel >= levelToOpenDaily &&
                    <div className="menu__mode-card__time">
                         <div className="menu__mode-card__hourglass"></div>
                         {timeLeft.hours}{t('hours-mini')} {timeLeft.minutes}{t('minutes-mini')}
                    </div>
               }

          </div>
     </div>
  )
}

export default Modes
