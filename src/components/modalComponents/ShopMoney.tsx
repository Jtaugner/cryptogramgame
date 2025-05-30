import React from 'react';
import './shopMoney.css';
import { UserDataProps } from '../../App';
import Modal from './Modal';
import { shopItems } from '../../main';

type ShopProps = {
  userData: UserDataProps,
  onClose: () => void;
  setUserData: (userData: UserDataProps) => void;
};


const shopItemCount: Record<string, number> = {
  'coins_1': 10,
  'coins_2': 50,
  'coins_3': 100,
}

const ShopMoney: React.FC<ShopProps> = ({userData, onClose, setUserData }) => {

    const getMoneyIconBackground = () => {
      if(shopItems && shopItems[0].getPriceCurrencyImage){
        let bg = shopItems[0].getPriceCurrencyImage('svg');
        console.log(bg);
        return `url(${bg}) no-repeat center center`;
      }
      return 'none';
    }
    const getMoneyName = () => {
      if(shopItems && shopItems[0].priceCurrencyCode){
        return shopItems[0].priceCurrencyCode;
      }
      return 'YAN';
    }
    return <Modal
            title="МОНЕТКИ"
            modalClassName="modal-shop-money"
            onClose={onClose}>
              <div className="moneyCount"><div className="modal-shop-row-price-icon"></div>{userData.money}</div>
              <div className="modal-section">
                <div className="modal-section-title">Монетки</div>
                {shopItems.slice(0, shopItems.length - 1).map((item, index) => (
                  <div className="modal-shop-row" key={'shop-money-item-' + index}>
                    <div className={`modal-shop-row-icon-coin modal-shop-row-icon-coin_${index}`}>
                    </div>
                    <div className="modal-shop-row-name">
                      <span className="modal-shop-row-name-count">{shopItemCount[item.id]} </span>
                      Монет
                      </div>
                    <div
                      className={`modal-shop-row-price`}>
                      <div>{item.priceValue}</div>
                      <div className="modal-shop-row-price_icon" style={{background: getMoneyIconBackground(), backgroundSize: '100%'}}></div>
                      <div className="modal-shop-row-price_money">{getMoneyName()}</div>
                    </div>
                  </div>
                ))}
                <div className="modal-section-title">Реклама</div>
                  <div className="modal-shop-row">
                    <div className={`modal-shop-row-icon-coin modal-shop-row-icon-coin_ad`}>
                    </div>
                    <div className="modal-shop-row-name">
                    Отключение рекламы  
                    </div>
                    <div
                      className={`modal-shop-row-price`}>
                        <div>{shopItems[shopItems.length - 1].priceValue}</div>
                      
                      <div className="modal-shop-row-price_icon" style={{background: getMoneyIconBackground(), backgroundSize: '100%'}}></div>
                      <div className="modal-shop-row-price_money">{getMoneyName()}</div>
                    </div>
                  </div>
              </div>
          </Modal>
}

export default ShopMoney; 