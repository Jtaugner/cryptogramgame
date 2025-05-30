import React, { useState } from 'react'
import './Menu.css'
import Lottie from 'react-lottie-player'
import animationData from '../Hi/Think.json'
import Statistics from './modalComponents/Statistics'
import { UserDataProps } from '../App'
import Settings from './modalComponents/Settings'
import Shop from './modalComponents/Shop'
import ShopMoney from './modalComponents/ShopMoney'
import Rating from './modalComponents/Rating'
import Collection from './modalComponents/Collection'


interface MenuProps {
  onStart: () => void
  userData: UserDataProps
  setUserData: (userData: UserDataProps) => void
}

const Menu: React.FC<MenuProps> = ({ onStart, userData, setUserData }) => {
     const getIQcolor = (iq: number) => {
          if (iq <= 80) return '#ef4444';
          if (iq <= 90) return '#ecea4d';
          if (iq <= 100) return '#ecbd4d';
          if (iq <= 110) return '#ecbd4d';
          if (iq <= 120) return '#16a34a';
          return '#3b82f6';
     }

     const [showStats, setShowStats] = useState(false)
     const [showSettings, setShowSettings] = useState(false)
     const [showShop, setShowShop] = useState(false)
     const [showShopMoney, setShowShopMoney] = useState(false)
     const [showRating, setShowRating] = useState(false)
     const [showCollection, setShowCollection] = useState(false)

     return (
     <div className="menu-bg">
          {/* Настройки */}
          <div className="menu__top">
               <div className="menu-settings-btn" onClick={() => setShowSettings(true)}></div>
               <div className="moneyCount" onClick={() => setShowShopMoney(true)}>
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
                    <span className="menu-daily-iq-number" style={{color: getIQcolor(userData.statistics.iq)}}> {userData.statistics.iq}</span>
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
                          <span className="menu-daily-iq-number" style={{color: getIQcolor(userData.statistics.iq)}}> {userData.statistics.iq}
                         </span>
                    </span>
                    <span className="menu-daily-arrow"></span>
                    <span className="menu-daily-iq menu-daily-nextiq">IQ 
                    <span className="menu-daily-iq-number" style={{color: getIQcolor(userData.statistics.iq + 1)}}> {userData.statistics.iq + 1}
                         </span>
                    </span>
               </div>
          </div>
          
          </div>
          {/* Продолжить */}
          <div className="menu-continue">
          <div className="menu-continue-btn" onClick={onStart}>
               <span>{userData.lastLevel === 0 ? 'ИГРАТЬ' : 'ПРОДОЛЖИТЬ'}</span>
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