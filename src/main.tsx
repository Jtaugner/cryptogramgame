import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './medias.css'
import { getTasks } from './tasks.tsx'
import { playSound } from './sounds.tsx'

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

let canPlaySound = true;

export const tryPlaySound = (soundName: string) => {
  if(!canPlaySound) return;
  playSound(soundName);
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


export function getServerTime(){
  let dateTime = new Date().getTime();
  try{
    dateTime = YSDK.serverTime()
  }catch(e){}
  return dateTime;
}


var playerGame: any;
export var payments: any;
var YSDK: any;

let recentData = stringifyJSON(userData);
// Сохранение данных в аккаунт пользователя Яндекса

var resetAllData = () => {
  userData = defaultUserData;
  saveData(userData);
}
(window as any).resetAllData = resetAllData;

function compareStrings(str1: string, str2: string) {
  const maxLength = Math.max(str1.length, str2.length);

  for (let i = 0; i < maxLength; i++) {
    const char1 = str1[i] || "(пусто)";
    const char2 = str2[i] || "(пусто)";

    if (char1 !== char2) {
      console.log(`❌ Несовпадение на позиции ${i}: "${char1}" !== "${char2}"`);
      console.log(str1.slice(i-8, i+8));
      console.log(str2.slice(i-8, i+8));
    }
  }
}

export function saveData(newUserData: any) {
    try{
        console.log('\x1b[33mTRY: saveData\x1b[0m');
        const newData = stringifyJSON(newUserData);
        if(newData === recentData) return;
        console.log('\x1b[32mDONE: saveData\x1b[0m');
        recentData = newData;
        setElementToLocalStorage('gameProgress', newData);
        if (playerGame) {
          const state = {gameProgress: newData};
          playerGame.setData(state).then((ignored: any) => {}).catch(()=>{});
        }
    }catch (ignored) {}
}

export function showRewarded(callback: () => void){
  try{
    YSDK.adv.showRewardedVideo({
      callbacks: {
          onOpen: () => {
            canPlaySound = false;
          },
          onRewarded: () => {
            callback();
          },
          onCancel: () => {
          },
          onClose: () => {
            canPlaySound = true;
          },
          onError: () => {
          },
      }
  })
  }catch(e){}
}

export var NOT_SHOW_ADV = false;

export function setNotShowAdv(){
  NOT_SHOW_ADV = true;
}

export function showAdv(){
  if(NOT_SHOW_ADV) return;
  try{
    console.log('showAdv');
    YSDK.adv.showFullscreenAdv({
        callbacks: {
            onOpen: function() {
              canPlaySound = false;
            },
            onClose: function(wasShown: boolean) {
              canPlaySound = true;
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
export const shopItemCount: Record<string, number> = {
  'coins_1': 10,
  'coins_2': 50,
  'coins_3': 100,
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

export function makePurchaseSDK(id: string, callback: (purchase: string) => void) {
  try{
    payments.purchase({ id: id})
    .then((purchase: any) => {
        callback(purchase.productID);
    }).catch((err: any) => {
        console.log('err', err);
    });
  }catch(e){}
}

export function tryToAddUserToLeaderboard(iq: number){
  try{
    YSDK.leaderboards.getPlayerEntry('iq')
    .then((res: any) => {
      if(res.score < iq){
        setUserToLeaderboard(iq);
      }
    })
    .catch((err: any) => {
      setUserToLeaderboard(iq);
    });
  }catch(e){}
}

export function setUserToLeaderboard(iq: number){
  try{
    YSDK.isAvailableMethod('leaderboards.setScore').then((res: boolean) => {
      if(res){
        console.log('setUserToLeaderboard', iq);
        YSDK.leaderboards.setScore('iq', iq);
      }
    })
  }catch(e){}
}

export function getLeaderboard(callback: (res: any) => void){
  try{
    YSDK.isAvailableMethod('leaderboards.setScore').then((res: boolean) => {
      if(res){
        YSDK.leaderboards.getEntries('iq',
          { quantityTop: 20, includeUser: true, quantityAround: 5 })
          .then((res: any) => callback(res));
      }else{
        YSDK.leaderboards.getEntries('iq',
          { quantityTop: 20})
          .then((res: any) => callback(res));
      }
    })

  }catch(e){}
  
  
}

export function consumePurchase(purchase: any) {
    try{
        console.log('try to consume: ', purchase.productID);
        if(purchase.productID === 'remove_ads') return;
        payments.consumePurchase(purchase.purchaseToken);
    }catch(e){}
}

export function initPlayer(ysdk: any) {
    ysdk.getPlayer({ scopes: true }).then((_player: any) => {
        console.log('INIT PLAYER');
        // Игрок авторизован.
        playerGame = _player;
        console.log('playerGame', playerGame);

        playerGame.getData(['gameProgress'], false).then((data: any) => {
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
                payments = _payments;
                //Получаем каталог покупок
                _payments.getCatalog().then((catalog: any) => {
                  shopItems = catalog;
                });
                // Покупки доступны.
                console.log('покупки доступны');
                createApp();
            }).catch((err: any) => {
                console.log(err);
                createApp();
            });
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
// @ts-ignore
if (window.YaGames) {
  // @ts-ignore
  window.YaGames.init()
      .then((ysdk: any) => {
          console.log('gt sdk');
          YSDK = ysdk;
          initPlayer(ysdk);
      });
} else {
  createApp();
}