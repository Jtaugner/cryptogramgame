import React from 'react';
import './shopMoney.css';
import { UserDataProps } from '../../App';
import Modal from './Modal';
import { shopItemCount, shopItems, NOT_SHOW_ADV } from '../../main';
import { useTranslation } from 'react-i18next';

type ShopProps = {
  onClose: () => void;
  makePurchase: (id: string) => void;
  isShopOpened: boolean;
};



const ShopMoney: React.FC<ShopProps> = ({onClose, makePurchase, isShopOpened }) => {
    const { t } = useTranslation();
    const getMoneyIconBackground = () => {
      if(__PLATFORM__ === 'yandex'){
        if(shopItems && shopItems[0].getPriceCurrencyImage){
          let bg = shopItems[0].getPriceCurrencyImage('svg');
          return `url(${bg}) no-repeat center center`;
        }
      }else if(__PLATFORM__ === 'gp' || __PLATFORM__ === 'mobile'){
        if(shopItems && shopItems[0].iconSmall){
          let bg = shopItems[0].iconSmall;
          return `url(${bg}) no-repeat center center`;
        }
      }

      return 'none';
    }
    const getMoneyName = (index: number) => {
      if(__PLATFORM__ === 'yandex'){
        if(shopItems && shopItems[0].priceCurrencyCode){
          return shopItems[0].priceCurrencyCode;
        }
      }else if(__PLATFORM__ === 'gp' || __PLATFORM__ === 'mobile'){
        if(shopItems && shopItems[index].currencySymbol){
          return shopItems[index].currencySymbol;
        }
      }
      
      return 'YAN';
    }
    return <Modal
            title={t('coins')}
            modalClassName="modal-shop-money"
            onClose={onClose}
            isShopOpened={isShopOpened}
            >
              <div className="modal-section">
                <div className="modal-section-title">{t('coins')}</div>
                {shopItems.slice(0, shopItems.length - 1).map((item, index) => (
                  <div className="modal-shop-row" key={'shop-money-item-' + index}>
                    <div className={`modal-shop-row-icon-coin modal-shop-row-icon-coin_${index}`}>
                    </div>
                    <div className="modal-shop-row-name">
                      <span className="modal-shop-row-name-count">{shopItemCount[item.id]} </span>
                      {t('coinsCount')}
                      </div>
                    <div
                      className={`modal-shop-row-price`}
                      onClick={() => makePurchase(item.id)}
                      >
                      <div>{item.priceValue}</div>
                      {
                        __PLATFORM__ === 'yandex'
                         ? <div className="modal-shop-row-price_icon" style={{background: getMoneyIconBackground(), backgroundSize: '100%'}}></div>
                         :
                         <div className={`modal-shop-row-price_money
                          ${__PLATFORM__ !== 'yandex' ? 'modal-shop-row-price_money_gp' : ''}`}>
                           {getMoneyName(index)}
                       </div>
                      }
                      

                    </div>
                  </div>
                ))}
                
                {!NOT_SHOW_ADV && (
                  <>
                  <div className="modal-section-title">{t('advert')}</div>
                  <div className="modal-shop-row">
                    <div className={`modal-shop-row-icon-coin modal-shop-row-icon-coin_ad`}>
                    </div>
                    <div className="modal-shop-row-name">
                    {t('removeAds')}
                    </div>
                    <div
                      className={`modal-shop-row-price`}
                      onClick={() => makePurchase('remove_ads')}
                      >
                      <div>{shopItems[shopItems.length - 1].priceValue}</div>
                      {
                        __PLATFORM__ === 'yandex'
                         && <div className="modal-shop-row-price_icon" style={{background: getMoneyIconBackground(), backgroundSize: '100%'}}></div>
                      }
                      <div className={`modal-shop-row-price_money
                         ${__PLATFORM__ !== 'yandex' ? 'modal-shop-row-price_money_gp' : ''}`}>
                          {getMoneyName(shopItems.length - 1)}
                      </div>
                    </div>
                  </div>
                  </>)}


              </div>
          </Modal>
}

export default ShopMoney; 