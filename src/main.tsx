import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './medias.css'
import './i18n'
import { getTasks } from './tasks.tsx'
import { playSound, switchOffMainMusic, switchOnMainMusic } from './sounds.tsx'
import { initLevels } from './levels.tsx'
import { main } from 'framer-motion/client'
// @ts-ignore
// import {allLevels} from './allLevels.js';

console.log('__PLATFORM__', __PLATFORM__);
let wasPurchase = false;
let ruLangs = ['ru', 'be', 'kk', 'uk', 'uz', 'kz'];

export let mainLanguage = 'ru';
let anotherLangDataForYandex = {};

function getGameProgressName(){
  if(mainLanguage === 'ru'){
    return 'gameProgress';
  }else{
    return 'gameProgress-' + mainLanguage;
  }
}

//Дефолтное состояние юзера
const defaultUserData = {
  lastLevel: 0,
  lastLevelData: null,
  tips: 10,
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
  money: 10,
  taskObject: null
}

let canPlaySound = true;

export const tryPlaySound = (soundName: string) => {
  if(!canPlaySound) return;
  playSound(soundName);
}

export function params(data: any) {
	try{
    let ymID = 102631060;
    if(__PLATFORM__ === 'gp') ymID = 103175743;
    if(mainLanguage !== 'ru'){
      let keys = Object.keys(data);
      keys.forEach(key => {
        data[key + '_en'] = data[key];
        delete data[key];
      });
    }
		// eslint-disable-next-line no-undef
		ym(ymID, 'params', data);
		// eslint-disable-next-line no-empty
	}catch(ignored){}
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
  let localStorageUserData = getFromLocalStorage(getGameProgressName());
  if(localStorageUserData) return JSON.parse(localStorageUserData);
  return defaultUserData;
}

let userData = getUserDataFromLocalStorage();
let appCreated = false;

async function createApp(){
  if(appCreated) return;
  appCreated = true;
  let module;
  if(mainLanguage === 'ru'){
    module = await import(`./allLevels.js`);
  }else{
    module = await import(`./allLevels-en.js`);
  }
  const allLevels = module.default;
  initLevels(allLevels, mainLanguage);
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App allUserData={userData} mainLanguage={mainLanguage} />
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
    if(__PLATFORM__ === 'yandex'){
      dateTime = YSDK.serverTime()
    }else if(__PLATFORM__ === 'gp'){
      dateTime = YSDK.serverTime;
    }
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


export function saveData(newUserData: any) {
    try{
        console.log('\x1b[33mTRY: saveData\x1b[0m');
        const newData = stringifyJSON(newUserData);
        if(newData === recentData) return;
        let lastData = recentData;
        console.log('\x1b[32mDONE: saveData\x1b[0m');
        recentData = newData;
        setElementToLocalStorage(getGameProgressName(), newData);

        if(__PLATFORM__ === 'yandex'){
          if (playerGame) {
            const state = {
              [getGameProgressName()]: newData,
              ...anotherLangDataForYandex
            };
            playerGame.setData(state).then((ignored: any) => {}).catch(()=>{});
          }
        }else if(__PLATFORM__ === 'gp'){
            //Сохраняем в gp
          lastData = JSON.parse(lastData);

          if(newUserData.lastLevel > lastData.lastLevel || wasPurchase){
            wasPurchase = false;
            YSDK.player.set(
                getGameProgressName(),
                newData
            );
            YSDK.player.set(
              'iq',
              newUserData.statistics.iq
            );
           // Синхронизовать, возвращает промис ожидания, дождитесь завершения
            YSDK.player.sync().then(() => {
              console.log('sync success');
            }).catch((err: any) => {
                console.log('sync error', err);
            });
          }
        }
    }catch (ignored) {}
}

export function showRewarded(callback: () => void){
  try{
    if(__PLATFORM__ === 'yandex'){
      YSDK.adv.showRewardedVideo({
        callbacks: {
          onOpen: () => {
            canPlaySound = false;
            switchOffMainMusic();
          },
          onRewarded: () => {
            callback();
          },
          onClose: () => {
            canPlaySound = true;
            switchOnMainMusic();
          }
        }
      })
    }else if(__PLATFORM__ === 'gp'){
      //Показываем рекламу в gp
      YSDK.ads.showRewardedVideo().then((success: boolean) => {
        if(success){
          callback();
        }
      }).catch((err: any) => {
        console.log('err', err);
      });
    }
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
    if(__PLATFORM__ === 'yandex'){
      YSDK.adv.showFullscreenAdv({
          callbacks: {
              onOpen: function() {
              canPlaySound = false;
              switchOffMainMusic();
            },
            onClose: function(wasShown: boolean) {
              canPlaySound = true;
              switchOnMainMusic();
              // Действие после закрытия рекламы.
            }
        }
      })
    }else if(__PLATFORM__ === 'gp'){
      //Показываем рекламу в gp
      YSDK.ads.showFullscreen();
    }
  }catch(e){

  }
  
}
export const shopItemCount: Record<string, number> = {
  'coins_1': 10,
  'coins_2': 50,
  'coins_3': 250,
}
//Покупки
export let shopItems = [
  {
    id: 'coins_1',
    priceValue: 9,
  },
  {
    id: 'coins_2',
    priceValue: 29,
  },
  {
    id: 'coins_3',
    priceValue: 99,
  },
  {
    id: 'remove_ads',
    priceValue: 99,
  },
]

export function makePurchaseSDK(id: string, callback: (purchase: string) => void) {
  try{
    if(__PLATFORM__ === 'yandex'){
      payments.purchase({ id: id})
      .then((purchase: any) => {
          callback(purchase.productID);
          wasPurchase = true;
          consumePurchase(purchase);
      }).catch((err: any) => {
        console.log('err', err);
      });
    }else if(__PLATFORM__ === 'gp'){
      YSDK.payments.purchase({ tag: id });
      YSDK.payments.on('purchase', () => {
        callback(id);
        wasPurchase = true;
        consumePurchase(id);
      });
    }
  }catch(e){}
}

export function tryToAddUserToLeaderboard(iq: number){
  if(__PLATFORM__ === 'gp') return;
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
  if(__PLATFORM__ === 'gp') return;
  try{
    if(__PLATFORM__ === 'yandex'){
      YSDK.isAvailableMethod('leaderboards.setScore').then((res: boolean) => {
        if(res){
          console.log('setUserToLeaderboard', iq);
          YSDK.leaderboards.setScore('iq', iq);
        }
      })
    }
  }catch(e){}
}

export function getLeaderboard(callback: (res: any) => void){
  try{

    if(__PLATFORM__ === 'yandex'){
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
    }else if(__PLATFORM__ === 'gp'){
        YSDK.leaderboard.fetch({
          orderBy: ['iq'],
          order: 'DESC',
          limit: 20,
          includeFields: ['iq'],
          withMe: 'last',
          showNearest: 5,
      })
      .then((res: any) => {
        let rating = {
          entries: [],
          userRank: res.player.position
        };
        let players = res.players;
        console.log('players', players);
        players.forEach((item: any) => {
          let ratingItem = {
            rank: item.position,
            score: item.iq,
            player: {
              publicName: item.name,
              getAvatarSrc: ()=>{
                return item.avatar;
              }
            }
          };
          rating.entries.push(ratingItem);
        });
        callback(rating);
      });
    }

  }catch(e){}
  
  
}

export function consumePurchase(purchase: any) {
    try{
      if(__PLATFORM__ === 'yandex'){
        console.log('try to consume: ', purchase.productID);
        if(purchase.productID === 'remove_ads') return;
        payments.consumePurchase(purchase.purchaseToken);
      }else if(__PLATFORM__ === 'gp'){
        if(purchase === 'remove_ads') return;
        YSDK.payments.consume({ tag: purchase });
      }
    }catch(e){}
}

export let gameLink = 'https://yandex.ru/games/app/435796';


function chooseLatestData(gp: any){
  gp = JSON.parse(gp);
  //Если локальные данные дальше, чем серверные, то используем локальные
  try{
    let localStorageUserData = getUserDataFromLocalStorage();
    if(localStorageUserData.lastLevel > gp.lastLevel){
        gp = localStorageUserData;
    }
    if(localStorageUserData.lastLevel === gp.lastLevel){
      console.log('lastLevel same', localStorageUserData.lastLevel, gp.lastLevel);
      //Если оба уровня заполнены, то сравниваем заполненные буквы
      if(localStorageUserData.lastLevelData && gp.lastLevelData){
        let filledLetters = Object.keys(localStorageUserData.lastLevelData.filledLetters);
        let filledLetters2 = Object.keys(gp.lastLevelData.filledLetters);
        if(filledLetters.length > filledLetters2.length){
          gp = localStorageUserData;
        }
      } //Если локальные данные заполнены, а серверные нет, то используем локальные
      else if(localStorageUserData.lastLevelData && !gp.lastLevelData){
        gp = localStorageUserData;
      }
    }
  }catch(e){}

  return gp;
}

export function initPlayer(ysdk: any) {
    ysdk.getPlayer({ scopes: true }).then((_player: any) => {
        console.log('INIT PLAYER');
        // Игрок авторизован.
        playerGame = _player;
        console.log('playerGame', playerGame);
        console.log(getGameProgressName());

        playerGame.getData(['gameProgress', 'gameProgress-en'], false).then((data: any) => {
            let gp = data[getGameProgressName()];
            if(getGameProgressName() === 'gameProgress-en'){
              anotherLangDataForYandex = {['gameProgress']: data['gameProgress']};
            }else{
              anotherLangDataForYandex = {['gameProgress-en']: data['gameProgress-en']};
            }
            //Вовзврат прогресса
            console.log(getGameProgressName());
            console.log(data);
            try {

                if(gp){
                  gp = chooseLatestData(gp);
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
                }else{
                  userData = getUserDataFromLocalStorage();
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
  if(__PLATFORM__ === 'yandex'){
    if(YSDK && YSDK.features && YSDK.features.LoadingAPI) YSDK.features.LoadingAPI.ready();
  }else if(__PLATFORM__ === 'gp'){
    if(YSDK && YSDK.gameStart) YSDK.gameStart();
  }
}
// @ts-ignore
if (__PLATFORM__ === 'yandex' && window.YaGames) {
  // @ts-ignore
  window.YaGames.init()
      .then((ysdk: any) => {
          console.log('gt sdk');
          YSDK = ysdk;
          let lang = ysdk?.environment?.i18n?.lang;
          if(ruLangs.includes(lang)){
            mainLanguage = 'ru';
          }else{
            mainLanguage = 'en';
          }
          console.log('lang', lang, mainLanguage);
          initPlayer(ysdk);
            ysdk.features.GamesAPI.getGameByID(435796).then(({isAvailable, game}) => {
              if (isAvailable) {
                  gameLink = game.url;
                  console.log('gameLink', gameLink);
              }
          }).catch(err => {
              // Ошибка при получении данных об игре.
          })
      });
}else if(__PLATFORM__ === 'gp') {
  // @ts-ignore
  window.onGPInit = async (gp) => {
    YSDK = gp;
    
    if(gp?.platform?.type === 'VK'){
      gameLink = 'https://vk.com/app53847636';
    }
    // Wait while the player syncs with the server
    await gp.player.ready;

    gp.player.fetchFields();

    // Поля получены (success === true)
    gp.player.on('fetchFields', (success) => {
      if(success && gp.player.has(getGameProgressName())){
        console.log('get player success');
        let newData = gp.player.get(getGameProgressName());
        if(newData){
          newData = chooseLatestData(newData);
          userData = newData;
          recentData = stringifyJSON(userData);
        }
        console.log('newData', newData);
        createApp();
      }else{
        createApp();
      }
    });
        // Начался показ рекламы
    gp.ads.on('start', () => {
      canPlaySound = false;
      switchOffMainMusic();
    });
    // Закончился показ рекламы
    gp.ads.on('close', (success) => {
      canPlaySound = true;
      switchOnMainMusic();
    });
    //Покупки
    payments = gp.payments;
    let products = gp.payments.products;
    console.log(products);
    products = products.map((product: any) => {
      return {
        ...product,
        priceValue: product.price,
        id: product.tag
      }
    });
    shopItems = products;


    //Sticky
    let platformType = gp.platform.type;
    console.log('Platform: ', platformType);
    params({'platform': platformType});
    try{
      let bannerDone = false;
      console.log('SDK');
      console.log(gp.platform);
      let sdk = gp.platform.getSDK();
      console.log(sdk);

      function showBanner(){
        console.log('show Banner');
        if(!bannerDone){
          if(platformType === 'VK') {
            sdk.bridge.send('VKWebAppShowBannerAd', {
              banner_location: 'bottom',
              layout_type: 'resize'
            })
              .then((data) => {
                console.log('show banner: ', data.result)
                bannerDone = data.result;
              })
              .catch((error) => {
                console.log(error);
              });
          }
        }
      }
      window.addEventListener("resize", function() {
        if(window.innerHeight < 600){
          if(platformType === 'VK') {
            sdk.bridge.send('VKWebAppHideBannerAd')
              .then((data) => {
                bannerDone = !data.result;
              })
              .catch((error) => {
                console.log(error);
              });
          }
        }else{
          showBanner();
        }

      }, false);
      if(window.innerHeight >= 600){
        showBanner();
      }

    }catch(e){
      console.log(e);
    }

    // You can start the game :)
  };
} else {
  createApp();
}