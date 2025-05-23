import React from 'react';
import './shopMoney.css';
import { UserDataProps } from '../../App';
import Modal from './Modal';

type ShopProps = {
  userData: UserDataProps,
  onClose: () => void;
  setUserData: (userData: UserDataProps) => void;
};

const shopItems = [
  {
    id: 'coins_1',
    count: 10,
    price: 350,
  },
  {
    id: 'coins_2',
    count: 50,
    price: 500,
  },
  {
    id: 'coins_3',
    count: 100,
    price: 1000,
  },
]


const ShopMoney: React.FC<ShopProps> = ({userData, onClose, setUserData }) => (
  <Modal
   title="МОНЕТКИ"
   modalClassName="modal-shop-money"
   onClose={onClose}>
      <div className="moneyCount"><div className="modal-shop-row-price-icon"></div>{userData.money}</div>
      <div className="modal-section">
        <div className="modal-section-title">Монетки</div>
        {shopItems.map((item, index) => (
          <div className="modal-shop-row" key={'shop-money-item-' + index}>
            <div className={`modal-shop-row-icon-coin modal-shop-row-icon-coin_${index}`}>
            </div>
            <div className="modal-shop-row-name">
              <span className="modal-shop-row-name-count">{item.count} </span>
              Монет
              </div>
            <button
             className={`modal-shop-row-price`}>
              {item.price} YAN
            </button>
          </div>
        ))}
        <div className="modal-section-title">Реклама</div>
        <div className="modal-shop-row">
            <div className={`modal-shop-row-icon-coin modal-shop-row-icon-coin_ad`}>
            </div>
            <div className="modal-shop-row-name">
            Отключение рекламы  
            </div>
            <button
             className={`modal-shop-row-price`}>
              800 YAN
            </button>
          </div>
      </div>
  </Modal>
);

export default ShopMoney; 