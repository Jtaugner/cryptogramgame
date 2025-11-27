import React, { useEffect, useRef, useState } from 'react'
import './Modes.css'
import { getCurrentDateFormatted, getCurrentMonth, getCurrentYear, getLocationByDate, getTimeLeftInDay, mainLanguage } from '../../main';
import { t } from 'i18next';
import { UserDataProps } from '../../App';
import { dailyLevels, formatSmallTime, levelToOpenCalendar } from '../../levels';
import { levelToOpenDaily } from '../../levels';

interface ModeProps {
     isAvailable: boolean,
     onClick: () => void,
     blockedText: string,
     cardName: string,
     playText: string,
     iqNumber: number,
     modeClass: string
}


const Mode: React.FC<ModeProps> = ({isAvailable, onClick, blockedText, cardName, playText, iqNumber, modeClass}) => {
     return (
          <div className={`menu__mode-card-wrapper ${modeClass}`}>
               <div
                    className={`menu__mode-card ${!isAvailable ? 'menu__mode-card_notAvailable' : ''}`}
                    onClick={onClick}
               >
                    {!isAvailable &&
                         <>
                              <div className="closedMode"></div>
                              <div className="closedMode__text">
                                   {blockedText}
                              </div>
                         </>
                    }
                    <div className="menu__mode-card__name">{cardName}</div>
                    <>
                         <div className="menu__mode-card__iq"
                              style={{
                                   opacity: isAvailable ? 1 : 0
                              }}>
                              + IQ
                              <div className="menu__mode-card__iq-number"> {iqNumber}</div>
                         </div>
                         <div className={`menu__mode-card__play ${isAvailable ? 'shiny-button shiny-button-anotherTiming' : ''}`}>
                              {playText}
                         </div>
                    </>

               </div>

          </div>
     )
}

export default Mode
