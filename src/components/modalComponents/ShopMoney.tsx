import React from 'react';
import './shopMoney.css';
import { UserDataProps } from '../../App';
import Modal from './Modal';
import { shopItemCount, shopItems, NOT_SHOW_ADV } from '../../main';

type ShopProps = {
  onClose: () => void;
  makePurchase: (id: string) => void;
  isShopOpened: boolean;
};



const ShopMoney: React.FC<ShopProps> = ({onClose, makePurchase, isShopOpened }) => {

    const getMoneyIconBackground = () => {
      if(shopItems && shopItems[0].getPriceCurrencyImage){
        let bg = shopItems[0].getPriceCurrencyImage('svg');
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
            onClose={onClose}
            isShopOpened={isShopOpened}
            >
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
                      className={`modal-shop-row-price`}
                      onClick={() => makePurchase(item.id)}
                      >
                      <div>{item.priceValue}</div>
                      <div className="modal-shop-row-price_icon" style={{background: getMoneyIconBackground(), backgroundSize: '100%'}}></div>
                      <div className="modal-shop-row-price_money">{getMoneyName()}</div>
                    </div>
                  </div>
                ))}
                
                {!NOT_SHOW_ADV && (
                  <>
                  <div className="modal-section-title">Реклама</div>
                  <div className="modal-shop-row">
                    <div className={`modal-shop-row-icon-coin modal-shop-row-icon-coin_ad`}>
                    </div>
                    <div className="modal-shop-row-name">
                    Отключение рекламы  
                    </div>
                    <div
                      className={`modal-shop-row-price`}
                      onClick={() => makePurchase('remove_ads')}
                      >
                        <div>{shopItems[shopItems.length - 1].priceValue}</div>
                      
                      <div className="modal-shop-row-price_icon" style={{background: getMoneyIconBackground(), backgroundSize: '100%'}}></div>
                      <div className="modal-shop-row-price_money">{getMoneyName()}</div>
                    </div>
                  </div>
                  </>)}


              </div>
          </Modal>
}

export default ShopMoney; 