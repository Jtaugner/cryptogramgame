import React from 'react';
import './shop.css';
import { UserDataProps } from '../../App';
import Modal from './Modal';

type ShopProps = {
  userData: UserDataProps,
  onClose: () => void;
  setUserData: (userData: UserDataProps) => void;
  openShopMoney: () => void;
};

type ShopItem = {
  id: string;
  name: string;
  count: number;
  price: number;
};
const shopItems = [
  {
    id: 'hint_1',
    name: '1 Подсказка',
    count: 1,
    price: 0,
  },
  {
    id: 'hint_1',
    name: '5 Подсказок',
    count: 5,
    price: 100,
  },
  {
    id: 'hint_2',
    name: '10 Подсказок',
    count: 10,
    price: 500,
  },
  {
    id: 'hint_3',
    name: '50 Подсказок',
    count: 50,
    price: 1000,
  }
]

const Shop: React.FC<ShopProps> = ({userData, onClose, setUserData, openShopMoney }) => {
  const buyItem = (item: ShopItem) => {
    if (userData.money >= item.price) {
      console.log('buy');
      // setUserData({ ...userData, money: userData.money - item.price });
    }else{
      openShopMoney();
    }
  }
  return <Modal
          title="МАГАЗИН"
          modalClassName="modal-shop"
          onClose={onClose}>
            <div className="moneyCount"><div className="modal-shop-row-price-icon"></div>{userData.money}</div>
            <div className="modal-section">
              <div className="modal-section-title">Подсказки</div>
              {shopItems.map((item, index) => (
                <div className="modal-shop-row" key={'shop-item-' + index}>
                  <div className="modal-shop-row-icon">
                    <div className="modal-shop-row-icon-count">{item.count}</div>
                  </div>
                  <div className="modal-shop-row-name">{item.name}</div>
                  <div
                    className={`modal-shop-row-price
                    ${userData.money <= item.price ? 'modal-shop-row-price_disabled' : ''}`}
                    onClick={() => buyItem(item)}
                    >
                    <div className="modal-shop-row-price-icon"></div>
                    {item.price}
                  </div>
                </div>
              ))}
            </div>
        </Modal>
}
export default Shop; 