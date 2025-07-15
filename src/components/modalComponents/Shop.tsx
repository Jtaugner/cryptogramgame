import React, { useEffect, useState } from 'react';
import './shop.css';
import { UserDataProps } from '../../App';
import Modal from './Modal';
import Counter from '../Counter/Counter';
import { makePlacesForCounter } from '../ProgressCounter';
import { getServerTime, showRewarded } from '../../main';
import { formatTime } from '../../levels';
import { useTranslation } from 'react-i18next';
type ShopProps = {
  userData: UserDataProps,
  onClose: () => void;
  setUserData: (userData: UserDataProps) => void;
  openShopMoney: () => void;
  showRewardTimer: number;
  setShowRewardTimer: (number: number) => void;
  playSound: (soundName: string) => void;
};

type ShopItem = {
  id: string;
  name: string;
  count: number;
  price: number;
  makePurchase: (id: string) => void;
};
const shopItems = [
  {
    id: 'hint_1',
    count: 1,
    price: 0,
  },
  {
    id: 'hint_1',
    count: 5,
    price: 10,
  },
  {
    id: 'hint_2',
    count: 10,
    price: 18,
  },
  {
    id: 'hint_3',
    count: 50,
    price: 80,
  }
]

function countRewardTime(showRewardTimer: number){
  if(showRewardTimer === 0) return 0;
  let time = (showRewardTimer + 5 * 60 * 1000) - getServerTime();
  time = Math.floor(time / 1000);
  if(time <= 0) return 0;
  return time;
}


const Shop: React.FC<ShopProps> = ({userData, onClose, setUserData,
   openShopMoney, showRewardTimer, setShowRewardTimer, playSound }) => {
  const { t } = useTranslation();
  const [rewardTimer, setRewardTimer] = useState(countRewardTime(showRewardTimer))

  const buyItem = (item: ShopItem) => {
    if (userData.money >= item.price) {
      if(item.price === 0){
        if(showRewardTimer !== 0) return;
        showRewarded(() => {
          //callback rewarded
          setUserData({
            ...userData,
            money: userData.money - item.price,
            tips: userData.tips + item.count
          });
          let time = getServerTime();
          setShowRewardTimer(time)
          setRewardTimer(countRewardTime(time))
          playSound('addMoney');
        })
      }else{

        setUserData({
          ...userData,
         money: userData.money - item.price,
         tips: userData.tips + item.count
       });
       playSound('addMoney');
      }

    }else{
      openShopMoney();
    }
  }
  useEffect(() => {
    let interval = 0;
    if(showRewardTimer > 0){
      interval = setInterval(() => {
        //Таймер на 5 минут
        let time = countRewardTime(showRewardTimer);
        if(time <= 0){
          setRewardTimer(0)
          setShowRewardTimer(0)
          clearInterval(interval)
        }else{
          setRewardTimer(time)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showRewardTimer])
  return <Modal
          title={t('shop')}
          modalClassName="modal-shop"
          onClose={onClose}>
            <div className="modal-section">
              <div className="modal-section-tips">{t('youHave')}:
              <Counter
                                    value={userData.tips}
                                    fontSize={20}
                                    places={makePlacesForCounter(userData.tips)}
                                    gap={4}
                                    borderRadius={0}
                                    classNameCounter="modal-section-tips-count"
                                    
                                /> 
                 {t('hint', {count: userData.tips})}
              </div>
              {/* <div className="modal-section-title">Подсказки</div> */}
              {shopItems.map((item, index) => (
                <div
                  className={`modal-shop-row`}
                  key={'shop-item-' + index}
                  >
                  <div className="modal-shop-row-icon">
                    <div className="modal-shop-row-icon-count">{item.count}</div>
                  </div>
                  <div className="modal-shop-row-name">{item.count} {t('hint', {count: item.count})}</div>
                  <div
                    className={`modal-shop-row-price
                    ${userData.money <= item.price ? 'modal-shop-row-price_disabled' : ''}
                    ${item.price === 0 && rewardTimer === 0 ? 'modal-shop-row-adv' : ''}`
                  }
                    onClick={() => buyItem(item)}
                    >
                      {item.price === 0 && rewardTimer > 0 &&
                        <div className="modal-shop-row-timer">
                          {formatTime(rewardTimer)}
                        </div>
                      }

                      {
                        item.price !== 0 &&
                        <>
                           <div className="modal-shop-row-price-icon"></div>
                           {item.price}
                        </>
                      }

                  </div>
                </div>
              ))}
            </div>
        </Modal>
}
export default Shop; 