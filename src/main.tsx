import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './medias.css'
import './i18n'
import { getTasks } from './tasks.tsx'
import { playSound, switchOffMainMusic, switchOnMainMusic } from './sounds.tsx'
import { initDailyLevels, initLevels, initLocationLevels } from './levels.tsx'
import { main } from 'framer-motion/client'
import { mobileShowFullscreenAd, mobileShowRewardedAd } from './mobile-sdk.tsx'
import { dailyLevels } from './levels.tsx'
// @ts-ignore
// import {allLevels} from './allLevels.js';

console.log('__PLATFORM__', __PLATFORM__);
let wasPurchase = false;
let ruLangs = ['ru', 'be', 'kk', 'uk', 'uz', 'kz'];

export let mainLanguage = 'ru';
export let isPurchaseAvailable = true;
export let gpBannerSize = 0;

if(__PLATFORM__ === 'gd'){
  mainLanguage = 'en';
  isPurchaseAvailable = false;
}else if(__PLATFORM__ === 'gp'){
  mainLanguage = 'ru';
}else if(__PLATFORM__ === 'mobile'){
  isPurchaseAvailable = false;
}

let anotherLangDataForYandex = {};

function getGameProgressName(){
  if(mainLanguage === 'ru'){
    return 'gameProgress';
  }else{
    return 'gameProgress-' + mainLanguage;
  }
}

//Дефолтное состояние юзера
const locationsNames = ['dailyLevel'];
let defaultUserData = {
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
    arrowLeft: false,
    autoScroll: true
  },
  money: 10,
  taskObject: null,
  locations: {}
}
locationsNames.forEach(name => {
  defaultUserData.locations[name] = {
    level: -1,
    data: null,
    currentDate: '',
    doneForToday: false
  }
})

let canPlaySound = true;

export const tryPlaySound = (soundName: string) => {
  if(!canPlaySound) return;
  playSound(soundName);
}

export function params(data: any) {
	try{
    if(__PLATFORM__ === 'gd' || __PLATFORM__ === 'mobile') return;
    let ymID = 102631060;
    if(__PLATFORM__ === 'gp') ymID = 103175743;
    if(mainLanguage !== 'ru'){
      let keys = Object.keys(data);
      keys.forEach(key => {
        data['en_' + key] = data[key];
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

function fixUserData(userData: any){
  if(!userData.locations) userData.locations = {};
  locationsNames.forEach(name => {
    if(!userData.locations[name]){
      userData.locations[name] = defaultUserData.locations[name];
    }
  })
  let lastLocationLevel = userData.locations['dailyLevel'].level;
  if(lastLocationLevel >= dailyLevels.length){
    userData.locations['dailyLevel'].level = dailyLevels.length;
  }


  if(userData.settings.autoScroll === undefined) userData.settings.autoScroll = defaultUserData.settings.autoScroll;
  return userData;
}

async function createApp(){
  if(appCreated) return;
  appCreated = true;
  let module;
  let dailyModule = null;
  let locationModule = null;
  if(mainLanguage === 'ru'){
    module = await import(`./allLevels.js`);
    dailyModule = await import(`./dailyLevels.js`);
    locationModule = await import(`./locationLevels.js`);
  }else{
    module = await import(`./allLevels-en.js`);
    dailyModule = await import(`./dailyLevels-en.js`);
  }
  const allLevels = module.default;
  initLevels(allLevels, mainLanguage);
  if(dailyModule){
    initDailyLevels(dailyModule.default, mainLanguage);
  }  
  if(locationModule){
    initLocationLevels(locationModule.default, mainLanguage);
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App allUserData={fixUserData(userData)} mainLanguage={mainLanguage} />
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
    let newTime;
    if(__PLATFORM__ === 'yandex'){
      newTime = YSDK.serverTime()
    }else if(__PLATFORM__ === 'gp' || __PLATFORM__ === 'mobile'){
      newTime = YSDK.serverTime;
      const currentDate = new Date(YSDK.serverTime);
      newTime = currentDate.getTime();
    }
    if(newTime){
      dateTime = newTime;
    }
  }catch(e){}
  return dateTime;
}
export function getCurrentMonth() {
  return new Date(getServerTime()).getMonth();
}
export function getCurrentDay() {
  return new Date(getServerTime()).getDate();
}
export function getCurrentYear() {
  return new Date(getServerTime()).getFullYear();
}
export function getLocationByDate(year = getCurrentYear(), month = getCurrentMonth()) {
  if (month < 10) {
    month = '0' + month;
  }
  return year + '-' + month;
}
export function getTimeLeftInDay() {
  const now = getServerTime();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const endOfDayTime = endOfDay.getTime();
  const diffMs = endOfDayTime - now;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, milliseconds: diffMs };
}
export function getCurrentDateFormatted() {
  const now = new Date(getServerTime());
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // месяцы с 0
  const year = now.getFullYear();

  return `${day}-${month}-${year}`;
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
        }else if(__PLATFORM__ === 'gp' || __PLATFORM__ === 'mobile'){
            //Сохраняем в gp
          lastData = JSON.parse(lastData);
          try{
            if(newUserData.lastLevel > lastData.lastLevel || wasPurchase || newUserData.statistics.iq > lastData.statistics.iq){
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
          }catch(e){}

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
            musicStoppedByAdv = true;
          },
          onRewarded: () => {
            callback();
          },
          onClose: () => {
            canPlaySound = true;
            switchOnMainMusic();
            musicStoppedByAdv = false;
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
    }else if(__PLATFORM__ === 'gd'){
      if (gdsdk !== 'undefined' && gdsdk.preloadAd !== 'undefined') {
        gdsdk.preloadAd('rewarded')
          .then(response => {
            console.log('preload rewarded')
          })
          .catch(error => {
            console.log('cant preload rewarded')
          });
      }
      if (gdsdk !== 'undefined' && gdsdk.showAd !== 'undefined') {
        gdsdk.showAd('rewarded')
          .then(response => {
            if(rewardedVideoDone){
              console.log('close adv reward');
              callback();
            }
          })
          .catch(error => {
            console.log(error)
          });
      }
    }else if(__PLATFORM__ === 'mobile'){
      mobileShowRewardedAd(callback);
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
    }else if(__PLATFORM__ === 'gd'){
      if (gdsdk && gdsdk.showAd !== 'undefined') {
        gdsdk.showAd();
      }
    }else if(__PLATFORM__ === 'mobile'){
      mobileShowFullscreenAd();
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
    }else if(__PLATFORM__ === 'gp' || __PLATFORM__ === 'mobile'){
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
  if(__PLATFORM__ === 'yandex'){
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
}

export function setUserToLeaderboard(iq: number){
  if(__PLATFORM__ === 'gp' || __PLATFORM__ === 'mobile') return;
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
    }else if(__PLATFORM__ === 'gp' || __PLATFORM__ === 'mobile'){
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
      }else if(__PLATFORM__ === 'gp' || __PLATFORM__ === 'mobile'){
        if(purchase === 'remove_ads') return;
        YSDK.payments.consume({ tag: purchase });
      }
    }catch(e){}
}

export let gameLink = 'https://yandex.ru/games/app/435796';

if(__PLATFORM__ === 'gd'){
  gameLink = '';
}


function chooseLatestData(gp: any){
  gp = JSON.parse(gp);
  //Если локальные данные дальше, чем серверные, то используем локальные
  try{
    let localStorageUserData = getUserDataFromLocalStorage();
    if(localStorageUserData.lastLevel > gp.lastLevel || localStorageUserData.statistics.iq > gp.statistics.iq){
        gp = localStorageUserData;
    }else if(localStorageUserData.lastLevel === gp.lastLevel){
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
        // console.log('playerGame', playerGame);

        playerGame.getData(['gameProgress', 'gameProgress-en'], false).then((data: any) => {
            let gp = data[getGameProgressName()];
            if(getGameProgressName() === 'gameProgress-en'){
              anotherLangDataForYandex = {['gameProgress']: data['gameProgress']};
            }else{
              anotherLangDataForYandex = {['gameProgress-en']: data['gameProgress-en']};
            }
            //Вовзврат прогресса
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
  }else if(__PLATFORM__ === 'gp' || __PLATFORM__ === 'mobile'){
    if(YSDK && YSDK.gameStart) YSDK.gameStart();
  }
}


function changeLanguage(lang: string){
  if(ruLangs.includes(lang)){
    mainLanguage = 'ru';
  }else{
    mainLanguage = 'en';
  }
}

export function switchOffAllMusic(){
  musicStoppedByAdv = true;
  switchOffMainMusic();
}
export function switchOnAllMusic(){
  switchOnMainMusic();
  musicStoppedByAdv = false;
}

// @ts-ignore
if (__PLATFORM__ === 'yandex' && window.YaGames) {
  // @ts-ignore
  window.YaGames.init()
      .then((ysdk: any) => {
          console.log('gt sdk');
          YSDK = ysdk;
          let lang = ysdk?.environment?.i18n?.lang;
          changeLanguage(lang);
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
}else if(__PLATFORM__ === 'gp' || __PLATFORM__ === 'mobile') {
  console.log('gp playform init');
  // @ts-ignore
  window.onGPInit = async (gp) => {
    console.log('gp init');
    YSDK = gp;
    changeLanguage(gp.language);
    
    if(gp?.platform?.type === 'VK'){
      gameLink = 'https://vk.com/app53847636';
    }else if(gp?.platform?.type === 'OK'){
      gameLink = 'https://ok.ru/game/cryptogram';
    }else{
      //link for mobile game
      gameLink = ''; 
    }
    // Wait while the player syncs with the server
    await gp.player.ready;

    if(gp.player.has(getGameProgressName())){
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

        // Начался показ рекламы
    gp.ads.on('start', () => {
      canPlaySound = false;
    });
    // Закончился показ рекламы
    gp.ads.on('close', (success) => {
      canPlaySound = true;
    });
        // Выключили звук
    gp.sounds.on('mute', () => {
      // Необходимо выключить все звуки в игре
      musicStoppedByAdv = true;
      switchOffMainMusic();
    });
    // Включили звук
    gp.sounds.on('unmute', () => {
      // Необходимо включить все звуки в игре
      switchOnMainMusic();
      musicStoppedByAdv = false;
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
    if(__PLATFORM__ === 'mobile'){
      return;
    }
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
      if(platformType !== 'VK' && platformType !== 'OK'){
        gp.ads.on('sticky:start', () => {
          setTimeout(() => { 
            try{
              console.log('sticky:start');
              console.log(document.querySelector('.gp-ads-fullscreen_sticky'));
              gpBannerSize = document.querySelector('.gp-ads-fullscreen_sticky').offsetHeight;
              document.querySelector('#root').style.paddingBottom = gpBannerSize + 'px';
            }catch(e){
              gpBannerSize = 0;
              document.querySelector('#root').style.paddingBottom = gpBannerSize + 'px';
            } 
          }, 1000);
          
          
        });
        gp.ads.on('sticky:close', () => {
          console.log('sticky:close');
            console.log(document.querySelector('.gp-ads-fullscreen_sticky'));
          gpBannerSize = 0;
          document.querySelector('#root').style.paddingBottom = gpBannerSize + 'px';
        });
        gp.ads.showSticky();
        gp.ads.showPreloader();
      }
      if (gp.payments.isAvailable) {
        isPurchaseAvailable = true;
      }else{
        isPurchaseAvailable = false;
      }

    }catch(e){
      console.log(e);
    }
  };
} else {
  createApp();
}