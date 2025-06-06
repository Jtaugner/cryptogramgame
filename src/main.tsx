import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './medias.css'

//Дефолтное состояние юзера
const defaultUserData = {
  lastLevel: 0,
  lastLevelData: null,
  tips: 5,
  statistics: {
    iq: 0,
    levels: 0,
    letters: 0,
    words: 0,
    perfectLevels: 0,
    errors: 0,
    avgTime: 0,
    bestTime: 0,
    lettersPerMinute: 0
  },
  settings: {
    sounds: true,
    music: true,
    arrowLeft: false
  },
  money: 582,
  taskObject: null
}

export const getFromLocalStorage = (name: string) => {
  try {
      const item = localStorage.getItem(name);
      if(item) return item;
  } catch (e) {}
  return null;

};
export const setElementToLocalStorage = (name: string, val: any) => {
  try {
      localStorage.setItem(name, val);
  } catch (e) {}
}

export const getUserDataFromLocalStorage = () => {
  let localStorageUserData = getFromLocalStorage("gameProgress");
  if(localStorageUserData) return JSON.parse(localStorageUserData);
  return defaultUserData;
}

let userData = getUserDataFromLocalStorage();

function createApp(){
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App allUserData={userData} />
    </StrictMode>

  )
}

function stringifyJSON(obj: any) {
  const json = JSON.stringify(obj, (key, value) => {
    if (value instanceof Set) {
      return [...value]; // сериализуем Set как массив
    }
    return value;
  });
  return json;
}




var playerGame: any;
let YSDK: any;

let recentData = stringifyJSON(userData);

// Сохранение данных в аккаунт пользователя Яндекса
export function saveData(newUserData: any) {
    try{
        console.log('TRY: saveData');
        const newData = stringifyJSON(newUserData);
        if(newData === recentData) return;
        console.log('DONE: saveData');
        recentData = newData;
        setElementToLocalStorage('gameProgress', newData);
        if (playerGame) {
          const state = {gameProgress: newData};
          playerGame.setData(state).then((ignored) => {}).catch(()=>{});
        }
    }catch (ignored) {}
}

export function showAdv(){
  try{
    console.log('showAdv');
    YSDK.adv.showFullscreenAdv({
        callbacks: {
            onClose: function(wasShown: boolean) {
              // Действие после закрытия рекламы.
            },
            onError: function(error: any) {
              // Действие в случае ошибки.
            }
        }
    })
  }catch(e){

  }
  
}

//Покупки
export let shopItems = [
  {
    id: 'coins_1',
    priceValue: 350,
  },
  {
    id: 'coins_2',
    priceValue: 500,
  },
  {
    id: 'coins_3',
    priceValue: 1000,
  },
  {
    id: 'remove_ads',
    priceValue: 800,
  },
]

function consumePurchase(purchase, payments) {
    try{
        console.log('try to consume: ', purchase.productID);
        for(let i = 0; i < shopItems.length; i++){
            if(shopItems[i].id === purchase.productID){
                console.log('addMoney');
                store.dispatch(addMoney(shopItems[i].amount));
                break;
            }
        }
        giveParams({[purchase.productID]: 1});
        payments.consumePurchase(purchase.purchaseToken);
        saveData();
    }catch(e){}
}

export function initPlayer(ysdk) {
    ysdk.getPlayer().then(_player => {
        console.log('INIT PLAYER');
        // Игрок авторизован.
        playerGame = _player;

        playerGame.getData(['gameProgress'], false).then((data) => {
            let gp = data.gameProgress;
            //Вовзврат прогресса
            console.log('gp', gp);
            try {

                if(gp){
                  gp = JSON.parse(gp);
                  //Если локальные данные дальше, чем серверные, то используем локальные
                  let localStorageUserData = getUserDataFromLocalStorage();
                  if(localStorageUserData.lastLevel > gp.lastLevel){
                      gp = localStorageUserData;
                  }
                }
                
                //Заменяем данные на нужные нам из payload
                let o = ysdk.environment.payload;
                if (o) {
                    let lvl = o.match(/gasjil\d+/);
                    if(lvl){
                        gp.lastLevel = Number(lvl[0].replace("gasjil", ""));
                    }
                    let tps = o.match(/tpajqs\d+/);
                    if(tps){
                        gp.money = Number(tps[0].replace("tpajqs", ""));
                    }
                    let dela = o.match(/dela\d+/);
                    if(dela){
                        gp.tips = Number(dela[0].replace("dela", ""));
                    }
                }
                if(gp){
                  //Заменяем данные
                  userData = gp;
                  recentData = stringifyJSON(userData);
                }
            } catch (d) {
                console.log(d)
            }
            ysdk.getPayments({signed: false}).then((_payments: any) => {
                //Получаем каталог покупок
                _payments.getCatalog().then((catalog: any) => {
                  shopItems = catalog;
                });
                // Покупки доступны.
                console.log('покупки доступны');
                _payments.getPurchases().then(purchases => purchases.forEach((id)=>{
                    console.log('consumePurchase', id);
                    consumePurchase(id, _payments);
                }));
            }).catch(err => {
                console.log(err);
            });
            createApp();
        }).catch((e: any) => {
            createApp();
        });
    }).catch((e: any) => {
        console.log(e);
        createApp();
    });

}

export const appIsReady = () => {
  if(YSDK && YSDK.features && YSDK.features.LoadingAPI) YSDK.features.LoadingAPI.ready();
}
if (window.YaGames) {
  window.YaGames.init()
      .then((ysdk: any) => {
          console.log('gt sdk');
          YSDK = ysdk;
          initPlayer(ysdk);
      });
} else {
  createApp();
}