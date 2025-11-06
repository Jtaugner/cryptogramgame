import React, { useEffect, useState } from 'react'
import './Calendar.css'
import { useTranslation } from 'react-i18next';
import { LevelDataProps, UserDataProps } from '../../App';
import { getCurrentMonth, getCurrentYear, getLocationByDate, getCurrentDay, showRewarded } from '../../main';
import { locationLevels } from '../../levels';

interface CalendarProps {
  onClose: () => void;
  calendarLocation: string;
  setCalendarLocation: (location: string) => void;
  userData: UserDataProps;
  setUserData: (userData: UserDataProps) => void;
  openCalendarLevel: (location: string, level: number) => void;
}
let currentMonth = getCurrentMonth();
let currentYear = getCurrentYear();
let currentMonthYear = getLocationByDate();
let currentDay = getCurrentDay();
let allDaysInMonth = 31;
let prizes = [
  20,
  8,
  15,
  16
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
  console.log('completedLevels', completedLevels);
  if(completedLevels === 0) return 0;
  return daysInProgressWidth[allDaysInMonth][completedLevels-1] + '%';
}

function getYearAndMonth(location: string) {
  let [year, month] = location.split('-');
  return { year: parseInt(year), month: parseInt(month) };
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


const Calendar: React.FC<CalendarProps> = ({ onClose, calendarLocation, userData,
   setUserData, openCalendarLevel, setCalendarLocation }) => {
  const { t } = useTranslation();
  const [calendarMonth, setCalendarMonth] = useState(calendarLocation);
  const [monthMatrix, setMonthMatrix] = useState(getMonthMatrix(calendarMonth));
  const [currentYearAndMonth, setCurrentYearAndMonth] = useState(getYearAndMonth(calendarMonth));
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [locationProgress, setLocationProgress] = useState(getDefaultLocationProgress());

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
  }, [calendarMonth]);

  //Выбираем выбранный день в календаре
  useEffect(() => {
    if(currentMonthYear === calendarMonth && !locationProgress.completedLevels.includes(currentDay-1)) {
      setSelectedDay(currentDay);
    }else{
      setSelectedDay(findFirstAvailableDay());
    }
  }, [monthMatrix]);

  const findFirstAvailableDay = () => {
    for(let day = 1; day <= 31; day++) {
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
    console.log(newLocation);
    if(isLocationExists(newLocation)) {
      setCalendarMonth(newLocation);
      setCalendarLocation(newLocation);
    }
  }
  const canShowArrow = (direction: number) => {
    let newLocation = findNextLocation(direction);
    return isLocationExists(newLocation)
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
    }
  }

  const openLevel = () => {
    openCalendarLevel(calendarMonth, selectedDay-1);
  }

  const openLevelWrapper = () => {
    if(!canUseDay(selectedDay)) return;
    if(shouldLookAdv(selectedDay)) {
      showRewarded(openLevel);
    } else {
      openLevel();
    }
  }

  useEffect(() => {


  }, [])

  return (
    <div className="calendar-wrapper">
          <div className="menu__top">
               <div className="menu-settings-btn" onClick={onClose}></div>
               <div className="redButton"
               onClick={() => {
                let completedLevels = locationProgress.completedLevels;
                completedLevels.push(1);
                setUserData({
                  ...userData,
                  locations: {
                    ...userData.locations,
                    [calendarMonth]: {
                      ...locationProgress,
                      completedLevels: completedLevels
                    }
                  }
                })
               }}
               >
               </div>
          </div>
          <div className="calendar">
               <div className="calendar-month">
                  <div className={`
                     calendar__arrow-left
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
                     calendar__arrow-right
                     ${canShowArrow(+1) ? '' : 'calendar__arrow_notVisible'}`
                     }
                      onClick={() => changeCalendarMonth(+1)}>

                  </div>
               </div>
               <div className="calendar__progress">
                <div
                 className={`calendar__progress-bar`}
                 style={{ width: getProgressbarWidth(allDaysInMonth, locationProgress.completedLevels.length)}}
                >

                </div>
                     <div className={`calendar__progress-bar__zero`}
                        style={{ left: '1.5%' }}>    
                      0              
                     </div>
                     <div
                          className="calendar__progress-bar__number"
                          style={{ left: daysInProgress[7] + '%'}}
                      >    
                          7
                          <div className="calendar__prize">
                            <div className="calendar__prize__money modal-shop-row-price-icon"></div>
                            <div className="calendar__prize__money-count">
                              {prizes[0]}
                            </div>   
                            <div className="calendar__prize__strip"></div>
                            <div className="calendar__prize__done"></div>
                          </div>
                     </div>
                     <div
                          className="calendar__progress-bar__number"
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
                          className="calendar__progress-bar__number"
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
                     <div className="calendar__progress-bar__number" style={{ left: '93.5%' }}>    
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
                className="calendar__play"
                onClick={openLevelWrapper}
               >
                {shouldLookAdv(selectedDay) && (
                  <div className="calendar__play__lookAdv">{t('lookAdv')}</div>
                )}
                <div>{t('play')}</div>
               </div>
               
               
          </div>
    </div>
  )
}

export default Calendar;