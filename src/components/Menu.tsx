import React, { useState } from 'react'
import './Menu.css'
import Lottie from 'react-lottie-player'
import animationData from '../Hi/Think.json'

interface MenuProps {
  onStart: () => void
  userData: {
    iq: number
    lastLevel: number
    lastLevelData: object
    tips: number
  }
}

const Menu: React.FC<MenuProps> = ({ onStart, userData }) => {
     const getIQcolor = (iq: number) => {
          if (iq <= 80) return '#ef4444';
          if (iq <= 90) return '#ecea4d';
          if (iq <= 100) return '#ecbd4d';
          if (iq <= 110) return '#ecbd4d';
          if (iq <= 120) return '#16a34a';
          return '#3b82f6';
     }

     return (
     <div className="menu-bg">
          {/* Настройки */}
          <div className="menu__top">
               <button className="menu-settings-btn"></button>
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
               <button onClick={onStart} className="menu-mode-play">ИГРАТЬ</button>
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
               <button disabled className="menu-mode-play">ИГРАТЬ</button>
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
                    <span className="menu-daily-iq-number" style={{color: getIQcolor(userData.iq)}}> {userData.iq}</span>
               </span>
          </div>
          <div className="menu-daily-row-block">
               <div className="menu-daily-row-block-left">
                    <div className="menu-daily-row">
                    <span className="menu-daily-label">Пройдено уровней</span>
                    <span className="menu-daily-value menu-daily-value-green">10/10</span>
                    </div>
                    <div className="menu-daily-row">
                    <span className="menu-daily-label">Время в игре (мин)</span>
                    <span className="menu-daily-value menu-daily-value-red">10/30</span>
                    </div>
                    <div className="menu-daily-row">
                    <span className="menu-daily-label">Побед без ошибок 0%</span>
                    <span className="menu-daily-value menu-daily-value-red">0/5</span>
                    </div>
               </div>
               
               <div className="menu-daily-broccoli">
                    <Lottie
                         loop         // зациклить
                         play         // сразу запускать
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
                          <span className="menu-daily-iq-number" style={{color: getIQcolor(userData.iq)}}> {userData.iq}
                         </span>
                    </span>
                    <span className="menu-daily-arrow"></span>
                    <span className="menu-daily-iq menu-daily-nextiq">IQ 
                    <span className="menu-daily-iq-number" style={{color: getIQcolor(userData.iq + 1)}}> {userData.iq + 1}
                         </span>
                    </span>
               </div>
          </div>
          
          </div>
          {/* Продолжить */}
          <div className="menu-continue">
          <button className="menu-continue-btn" onClick={onStart}>
               <span>ПРОДОЛЖИТЬ</span>
               <span className="menu-continue-btn__level">УРОВЕНЬ 4</span></button>
          </div>
          </div>
          
          {/* Нижнее меню */}
          <div className="menu-bottom">
               <div className="menu-bottom-wrap">
                    <div className="menu-bottom-item">
                         <div className="menu-bottom-icon icon-shop"></div>
                         <span className="menu-bottom-label">Магазин</span>
                    </div>
               </div>
          
          </div>
     </div>
     )
}

export default Menu 