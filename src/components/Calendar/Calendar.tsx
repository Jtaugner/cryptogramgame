import React, { useEffect, useRef, useState } from 'react'
import './Calendar.css'
import { useTranslation } from 'react-i18next';
import { LevelDataProps, UserDataProps } from '../../App';
import { getCurrentMonth, getCurrentYear, getLocationByDate, getCurrentDay, showRewarded } from '../../main';
import { locationLevels } from '../../levels';
import CollectionCategory from '../modalComponents/CollectionCategory';

interface CalendarProps {
  isCalendarOpen: boolean;
  onClose: () => void;
  calendarLocation: string;
  setCalendarLocation: (location: string) => void;
  userData: UserDataProps;
  setUserData: (userData: UserDataProps) => void;
  openCalendarLevel: (location: string, level: number) => void;
  calendarLevelDone: boolean;
  setCalendarLevelDone: (calendarLevelDone: boolean) => void;
  noOpenAnimation: boolean;
  playSound: (soundName: string) => void;
  copyFunction: (collectionData: {text: string, name: string, desc: string}) => void;
}
let currentMonth = getCurrentMonth();
let currentYear = getCurrentYear();
let currentMonthYear = getLocationByDate();
let currentDay = getCurrentDay();
let allDaysInMonth = 31;
export function getAllPrizesDays(){
  return [7, 14, 21, allDaysInMonth];
}
export let prizes = [
  20,
  7,
  15,
  15
]
let daysInProgress = {
  7: 23,
  14: 45,
  21: 69,
}
const daysInProgressWidth = {
  28: [5.5, 9, 12.5, 16, 19.5, 23, 26.5, 30, 33.5, 37, 40.5, 44, 47.5, 51, 54.429, 57.857, 61.286, 64.714, 68.143, 71.571, 75, 78.571, 82.143, 85.714, 89.286, 92.857, 96.429, 100],
  29: [5.5, 9, 12.5, 16, 19.5, 23, 26.5, 30, 33.5, 37, 40.5, 44, 47.5, 51, 54.429, 57.857, 61.286, 64.714, 68.143, 71.571, 75, 78.125, 81.25, 84.375, 87.5, 90.625, 93.75, 96.875, 100],
  30: [5.5, 9, 12.5, 16, 19.5, 23, 26.5, 30, 33.5, 37, 40.5, 44, 47.5, 51, 54.429, 57.857, 61.286, 64.714, 68.143, 71.571, 75, 77.778, 80.556, 83.333, 86.111, 88.889, 91.667, 94.444, 97.222, 100],
  31: [5.5, 9, 12.5, 16, 19.5, 23, 26.5, 30, 33.5, 37, 40.5, 44, 47.5, 51, 54.429, 57.857, 61.286, 64.714, 68.143, 71.571, 75, 77.5, 80, 82.5, 85, 87.5, 90, 92.5, 95, 97.5, 100]
}
function getProgressbarWidth(allDaysInMonth: number, completedLevels: number) {
  if(completedLevels <= 0) return '0%';
  return daysInProgressWidth[allDaysInMonth][completedLevels-1] + '%';
}

function getYearAndMonth(location: string) {
  let [year, month] = location.split('-');
  return { year: parseInt(year), month: parseInt(month) };
}

let currentLocationOutside = 'autumn';

export function getClassForLocationBackground() {
  return 'winterLocation';
  return 'autumnLocation';
}

function getMonthMatrix(location: string) {
  let { year, month } = getYearAndMonth(location);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7; // понедельник = 0
  const daysInMonth = lastDay.getDate();
  allDaysInMonth=daysInMonth;

  const matrix = Array.from({ length: 6 }, () => Array(7).fill(0));
  let day = 1;

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;
      if (cellIndex >= startWeekday && day <= daysInMonth) {
        matrix[row][col] = day++;
      }
    }
  }

  return matrix;
}

function isLocationExists(location: string) {
  if(locationLevels[location]) {
    return true;
  }
  return false;
}
function getDefaultLocationProgress() {
  return {
    completedLevels: [] as number[],
    currentLevels: [] as number[],
    currentLevelsData: {} as Record<number, LevelDataProps>
  }
}


const Calendar: React.FC<CalendarProps> = ({ isCalendarOpen, onClose, calendarLocation, userData,
   setUserData, openCalendarLevel, setCalendarLocation, calendarLevelDone, setCalendarLevelDone, noOpenAnimation, playSound, copyFunction }) => {
  const { t } = useTranslation();
  const [calendarMonth, setCalendarMonth] = useState(calendarLocation);
  const [monthMatrix, setMonthMatrix] = useState(getMonthMatrix(calendarMonth));
  const [currentYearAndMonth, setCurrentYearAndMonth] = useState(getYearAndMonth(calendarMonth));
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [locationProgress, setLocationProgress] = useState(getDefaultLocationProgress());
  const [isProgressAnimation, setIsProgressAnimation] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [collectionLevel, setCollectionLevel] = useState<number>(0);
  const [locationDone, setLocationDone] = useState(false);
  const timeoutIds = useRef<number[]>([]);

  useEffect(() => {
    if(calendarLevelDone) {
      setIsProgressAnimation(true);
      setCalendarLevelDone(false);
      console.log(locationProgress.completedLevels.length, getAllPrizesDays());
    }
  }, [calendarLevelDone]);

  useEffect(() => {
    setCurrentYearAndMonth(getYearAndMonth(calendarMonth));
    if(userData.locations[calendarMonth]) {
      setLocationProgress(userData.locations[calendarMonth] as { completedLevels: number[], currentLevels: number[], currentLevelsData: Record<number, LevelDataProps> });
    } else {
      setLocationProgress(getDefaultLocationProgress());
      setUserData({
        ...userData,
        locations: {
          ...userData.locations,
          [calendarMonth]: getDefaultLocationProgress()
        }
      })
    }
    setMonthMatrix(getMonthMatrix(calendarMonth));
    currentLocationOutside = calendarMonth;
  }, [calendarMonth]);

  //Выбираем выбранный день в календаре
  useEffect(() => {
    if(currentMonthYear === calendarMonth && !locationProgress.completedLevels.includes(currentDay-1)) {
      setSelectedDay(currentDay);
    }else{
      setSelectedDay(findFirstAvailableDay());
    }
    let isLocationDone = true;
    for(let day = 1; day <= allDaysInMonth; day++) {
      if(!locationProgress.completedLevels.includes(day-1)) {
        isLocationDone = false;
        break;
      }
    }
    setLocationDone(isLocationDone);
  }, [monthMatrix]);

  const findFirstAvailableDay = () => {
    for(let day = 1; day <= allDaysInMonth; day++) {
      if(canUseDay(day)) {
        console.log('first available day', day);
        return day;
      }
    }
    return 1;
  }

  const findNextLocation = (direction: number) => {
    let { year, month } = currentYearAndMonth;
    month += direction;
    if(month < 0){
      month = 11;
      year--;
    } else if(month > 11){
      month = 0;
      year++;
    }
    return getLocationByDate(year, month);
  }

  const changeCalendarMonth = (direction: number) => {
    let newLocation = findNextLocation(direction);
  
    if(isLocationExists(newLocation) && newLocation <= currentMonthYear) {
      setCalendarMonth(newLocation);
      setCalendarLocation(newLocation);
    }
  }
  const canShowArrow = (direction: number) => {
    let newLocation = findNextLocation(direction);
    return isLocationExists(newLocation) && newLocation <= currentMonthYear;
  }
  const shouldLookAdv = (day: number) => {
    if(!canUseDay(day)) return false;
    if(locationProgress.currentLevels.includes(day-1)) return false;
    if(currentMonthYear === calendarMonth && day === currentDay) return false;
    return true;
  }

  const canUseDay = (day: number) => {
    if(day === 0) return false;
    if(locationProgress.completedLevels.includes(day-1)) return false;
    if(currentMonthYear !== calendarMonth) return true;
    if(day <= currentDay) return true;
    return false;
  }
  const selectDay = (day: number) => {
    if(canUseDay(day)) {
      setSelectedDay(day);
    }else{
      tryOpenCollection(day);
    }
  }

  const openLevel = () => {
    openCalendarLevel(calendarMonth, selectedDay-1);
    //Добавляем день в текущие уровни
    let currentLevels = userData.locations?.[calendarMonth]?.currentLevels || [];
    console.log('currentLevels', currentLevels);
    if(!currentLevels.includes(selectedDay-1)) {
      currentLevels.push(selectedDay-1);
      setUserData({
        ...userData,
        locations: {
          ...userData.locations,
          [calendarMonth]: {
            ...userData.locations[calendarMonth],
            currentLevels: currentLevels
          }
        }
      })
    }

  }

  const openLevelWrapper = () => {
    if(!canUseDay(selectedDay) || locationDone) return;
    if(shouldLookAdv(selectedDay)) {
      showRewarded(openLevel);
      // openLevel();
    } else {
      openLevel();
    }
  }
  const tryOpenCollection = (level: number) => {
    if(locationProgress.completedLevels.includes(level-1)){
      console.log('open collection', level-1);
      setShowCollection(true);
      setCollectionLevel(level-1);
      return;
    }
  }

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(timeoutId => clearTimeout(timeoutId));
    }
  }, [])

  return (
    <div className={`
      calendar-wrapper
       ${isCalendarOpen ? 'calendar-wrapper_open' : 'calendar-wrapper_close'}
       ${getClassForLocationBackground()}
       ${noOpenAnimation ? 'calendar-wrapper_noOpenAnimation' : ''}
    `}>
          <div className="bg-overlay"></div>
          <div className="menu__top">
               <div className="menu-settings-btn extended-click" onClick={onClose}></div>
          </div>
          <div className="calendar">
               <div className="calendar-month">
                  <div className={`
                     calendar__arrow-left extended-click
                     ${canShowArrow(-1) ? '' : 'calendar__arrow_notVisible'}`
                     }
                      onClick={() => changeCalendarMonth(-1)}>

                  </div>
                  <div className="calendar-month-center">
                    <div className="calendar-month-name">   
                      {t('monthName' + currentYearAndMonth.month) + ' ' + currentYearAndMonth.year}
                    </div>
                    <div className="calendar-location-name">   
                      {t('location' + calendarMonth)}
                    </div>
                  </div>
                  <div className={`
                     calendar__arrow-right extended-click
                     ${canShowArrow(+1) ? '' : 'calendar__arrow_notVisible'}`
                     }
                      onClick={() => changeCalendarMonth(+1)}>

                  </div>
               </div>
               <div className="calendar__progress"
                onAnimationEnd={(e) => {
                  if(e.animationName === 'progressBarNumberAnimate') {
                    playSound('getPrize');
                  }
                }}
               >
                <div
                 className={`calendar__progress-bar
                   ${isProgressAnimation ? 'calendar__progress-bar_animation' : ''}
                   ${isProgressAnimation && locationProgress.completedLevels.length === 1 ? 'calendar__progress-bar_zero_animation_first' : ''}
                   `}
                 style={{
                   width: isProgressAnimation ?
                    getProgressbarWidth(allDaysInMonth, locationProgress.completedLevels.length -1) :
                    getProgressbarWidth(allDaysInMonth, locationProgress.completedLevels.length),
                   ["--width-before" as any]: getProgressbarWidth(allDaysInMonth, locationProgress.completedLevels.length - 1),
                   ["--width" as any]: getProgressbarWidth(allDaysInMonth, locationProgress.completedLevels.length)
                  
                  }}
                >

                </div>
                     <div
                      className={`
                        calendar__progress-bar__zero
                        ${isProgressAnimation && locationProgress.completedLevels.length === 1 ? 'calendar__progress-bar__number_animate' : ''}
                        ${locationProgress.completedLevels.length > 0 ? 'calendar__progress-bar__number_done' : ''}
                        `}
                        style={{ left: '1.5%' }}>    
                      {locationProgress.completedLevels.length}              
                     </div>
                     <div
                          className={`calendar__progress-bar__number
                             ${isProgressAnimation && locationProgress.completedLevels.length === 7 ? 'calendar__progress-bar__number_animate' : ''}
                             ${locationProgress.completedLevels.length >= 7 ? 'calendar__progress-bar__number_done' : ''}
                             `}
                          style={{ left: daysInProgress[7] + '%'}}
                      >    
                          7
                          <div className="calendar__prize">
                            <div className="calendar__prize__money"></div>
                            <div className="calendar__prize__money-count">
                              {prizes[0]}
                            </div>   
                            <div className="calendar__prize__strip"></div>
                            <div className="calendar__prize__done"></div>
                          </div>
                     </div>
                     <div
                          className={`calendar__progress-bar__number
                            ${isProgressAnimation && locationProgress.completedLevels.length === 14 ? 'calendar__progress-bar__number_animate' : ''}
                            ${locationProgress.completedLevels.length >= 14 ? 'calendar__progress-bar__number_done' : ''}
                            `}
                          style={{ left: daysInProgress[14] + '%'}}
                      >    
                          14
                          <div className="calendar__prize">
                            <div className="calendar__prize__iq">
                              <div className="calendar__prize__count">{prizes[1]}</div>
                            </div>
                            <div className="calendar__prize__strip"></div>
                            <div className="calendar__prize__done"></div>
                          </div>  
    
                     </div>
                     <div
                          className={`calendar__progress-bar__number
                            ${isProgressAnimation && locationProgress.completedLevels.length === 21 ? 'calendar__progress-bar__number_animate' : ''}
                            ${locationProgress.completedLevels.length >= 21 ? 'calendar__progress-bar__number_done' : ''}
                            `}
                          style={{ left: daysInProgress[21] + '%'}}
                      >    
                          21
                          <div className="calendar__prize">
                            <div className="calendar__prize__tip">
                              <div className="calendar__prize__count">{prizes[2]}</div>
                            </div>
                            <div className="calendar__prize__strip"></div>
                            <div className="calendar__prize__done"></div>
                          </div>      
              
                     </div>                
                     <div
                          className={`calendar__progress-bar__number
                            ${isProgressAnimation && locationProgress.completedLevels.length === allDaysInMonth ? 'calendar__progress-bar__number_animate' : ''}
                            ${locationProgress.completedLevels.length >= allDaysInMonth ? 'calendar__progress-bar__number_done' : ''}
                          `}
                     
                     style={{ left: '93.5%' }}>    
                      {allDaysInMonth}   
                      <div className="calendar__prize">
                            <div className="calendar__prize__iq">
                              <div className="calendar__prize__count">{prizes[3]}</div>
                            </div>
                            <div className="calendar__prize__strip"></div>
                            <div className="calendar__prize__done"></div>
                          </div>                 
                     </div>
               </div>
               <div className="calendar__days">
                {
                  monthMatrix.map((row, index) => (
                    <div
                     className="calendar__days-row"
                     key={'row' + index}
                     >
                      {row.map((day, index) => (
                        <div
                         className={`
                            calendar__day
                            ${day === 0 ? 'calendar__day_notVisible' : ''}
                            ${canUseDay(day) ? '' : 'calendar__day_notAvailable'}
                            ${currentMonthYear === calendarMonth && day === currentDay ? 'calendar__day_today' : ''}
                            ${day === selectedDay ? 'calendar__day_selected' : ''}
                            ${locationProgress.currentLevels.includes(day-1) ? 'calendar__day_inProcess' : ''}
                            ${locationProgress.completedLevels.includes(day-1) ? 'calendar__day_completed' : ''}
                            ${shouldLookAdv(day) ? 'calendar__day_lookAdv' : ''}
                          `}
                          onClick={() => selectDay(day)}
                          key={'day' + index}
                        >
                          {locationProgress.completedLevels.includes(day-1) ? '' : day}
                        </div>
                      ))}
                    </div>
                  ))
                }
               </div>

               <div
                className={`calendar__play ${locationDone ? 'calendar__play_done' : ''}`}
                onClick={openLevelWrapper}
               >
                {shouldLookAdv(selectedDay) && (
                  <div className="calendar__play__lookAdv">{t('lookAdv')}</div>
                )}
                <div>{t('play')}</div>
               </div>
               
               
          </div>
          {showCollection && (
            <CollectionCategory
              onClose={() => setShowCollection(false)}
              category={locationLevels[calendarMonth][collectionLevel].type}
              categoryIndex={1}
              copyFunction={copyFunction}
              collectionLevelData={locationLevels[calendarMonth][collectionLevel]}
            />
          )}
    </div>
  )
}

export default Calendar;