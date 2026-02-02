import { StrictMode } from 'react'
import { createRoot, Root } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './medias.css'
import './medias-horizont.css'
import './i18n'
import { getTasks } from './tasks.tsx'
import { playSound, stopSound, switchOffMainMusic, switchOnMainMusic } from './sounds.tsx'
import { initAllNames, initDailyLevels, initLevels, initLocationLevels } from './levels.tsx'
import { main } from 'framer-motion/client'
import { addUserToRating, mobileShowFullscreenAd, mobileShowRewardedAd, paramsForMobile } from './mobile-sdk.tsx'
import { dailyLevels } from './levels.tsx'
import { detectAppLanguage, getLang } from './language.tsx'
// @ts-ignore
// import {allLevels} from './allLevels.js';

console.log('__PLATFORM__', __PLATFORM__);
console.log('__MODE__', __MODE__);
let wasPurchase = false;
let root: Root | null = null;

export let isScreenMode = __MODE__ === 'screen';
export let mainLanguage = 'ru';
export let isPurchaseAvailable = true;
export let gpBannerSize = 0;
export let isCopyAvailable = true;
export let isRewardedAvailable = true;

let canUseYoutubeSDK = false;

if(__PLATFORM__ === 'gd'){
  changeLanguage(getLang());
  isPurchaseAvailable = false;
}else if(__PLATFORM__ === 'gp'){
  // mainLanguage = 'ru';
}else if(__PLATFORM__ === 'mobile' || __PLATFORM__ === 'yt'){
  mainLanguage = 'en';
  isPurchaseAvailable = false;
  changeLanguage(getLang());
}

if(__PLATFORM__ === 'yt'){
  isCopyAvailable = false;
  isRewardedAvailable = false;
}

let anotherLangDataForYandex = {};
let YT_DATA = {};

function getGameProgressName(){
  if(mainLanguage === 'ru'){
    return 'gameProgress';
  }else{
    return 'gameProgress-' + mainLanguage;
  }
}

//Дефолтное состояние юзера
const locationsNames = ['dailyLevel'];
let defaultUserStats = {
  broccoliKilled: '',
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
  startedDate: getCurrentDateFormatted()
}
//Убрать при релизе
if(__PLATFORM__ === 'mobile'){
  defaultUserStats.money = 50;
}



let defaultUserData = {
  lastLevel: 0,
  lastLevelData: null,
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
  if(!canPlaySound) return false;
  playSound(soundName);
  return true;
}

export function params(data: any) {
  if(__PLATFORM__ === 'yt') return;
  if(__PLATFORM__ === 'mobile') {
    paramsForMobile(mainLanguage, data);
    return;
  }
  let newData = {
    [mainLanguage]: {
      ...data
    }
  }
	try{
    if(__PLATFORM__ === 'gd') return;
    let ymID = 102631060;
    if(__PLATFORM__ === 'gp') ymID = 103175743;
		ym(ymID, 'params', newData);
		
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
  return {...defaultUserData};
}
export const getUserStatsFromLocalStorage = () => {
  let localStorageUserStats = getFromLocalStorage('userStats');
  if(localStorageUserStats) return JSON.parse(localStorageUserStats);
  return {...defaultUserStats};
}
function fixUserStats(userData: any){
  if(userData.statistics){

    if(userData.startedDate === undefined) userData.startedDate = getCurrentDateFormatted();
    globalUserStats = {
      tips: userData.tips,
      statistics: userData.statistics,
      settings: userData.settings,
      money: userData.money,
      taskObject: userData.taskObject,
      broccoliKilled: "",
      startedDate: userData.startedDate
    }
    delete userData.tips;
    delete userData.statistics;
    delete userData.settings;
    delete userData.money;
    delete userData.taskObject;
    delete userData.startedDate;
    delete userData.broccoKilled;
  }
}

let appCreated = false;
let prefferedLanguage: string = getFromLocalStorage('prefferedLanguage') || "";
if(prefferedLanguage) mainLanguage = prefferedLanguage;
let userData = getUserDataFromLocalStorage();
let globalUserStats = getUserStatsFromLocalStorage();

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
  recentData = stringifyJSON(userData);
  if(userData.startedDate === undefined) userData.startedDate = getCurrentDateFormatted();
  return userData;
}

async function createApp(){
  if(appCreated) return;
  appCreated = true;
  let mainModule;
  let dailyModule = null;
  let locationModule = null;
  let allNamesModule = null;
  mainModule = await import(`./levels/${mainLanguage}/allLevels.js`);
  try {
    dailyModule = await import(`./levels/${mainLanguage}/dailyLevels.js`);
  } catch (err) {
    dailyModule = null;
  }
  try {
    locationModule = await import(`./levels/${mainLanguage}/locationLevels.js`);
  } catch (err) {
    locationModule = null;
  }
  try {
    allNamesModule = await import(`./levels/${mainLanguage}/allNames.js`);
  } catch (err) {
    allNamesModule = null;
  }
  
  
  

  initLevels(mainModule.default, mainLanguage);

  if(dailyModule){
    initDailyLevels(dailyModule.default, mainLanguage);
  }  
  if(locationModule){
    initLocationLevels(locationModule.default, mainLanguage);
  }
  if(allNamesModule){
    initAllNames(allNamesModule.default);
  }

  if (!root) {
    root = createRoot(document.getElementById("root")!);
  } else {
    root.unmount();
    root = createRoot(document.getElementById("root")!);
  }
  if(globalUserStats.statistics.iq === 0){
    fixUserStats(userData)
  }
  let data = chooseLatestData({
    ...userData,
    ...globalUserStats
  }, {
    ...getUserDataFromLocalStorage(),
    ...getUserStatsFromLocalStorage()
  });
  // console.log('data', data);
  root.render(
    <StrictMode>
      <App allUserData={fixUserData(data)} mainLanguage={mainLanguage} />
    </StrictMode>

  )
}

export function recreateApp(lang: string){
  mainLanguage = lang;
  prefferedLanguage = lang;
  setElementToLocalStorage('prefferedLanguage', lang);
  appCreated = false;
  params({'recreateApp': lang});
  if(__PLATFORM__ === 'yandex'){
    getDataYandex();
  }else if(__PLATFORM__ === 'gp'){
    getDataGP();
  }else if(__PLATFORM__ === 'yt'){
    getDataYT();
  }else{
    userData = getUserDataFromLocalStorage();
  }
  stopSound('music');
  createApp();
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
    }else if(__PLATFORM__ === 'gp'){
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
export function daysSince(dateStr: string) {
  if(!dateStr) return 0;
  const [day, month, year] = dateStr.split('-').map(Number);

  // Дата из строки (месяц − 1, потому что в JS месяцы 0–11)
  const startDate = new Date(year, month - 1, day);

  // Сегодня без времени (чтобы считать целые дни)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Разница в миллисекундах
  const diffMs = today.getTime() - startDate.getTime();

  // Переводим в дни
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return days < 0 ? 0 : days; // если дата в будущем — вернуть 0
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
  // return;
    try{
        console.log('\x1b[33mTRY: saveData\x1b[0m');
        const dataForTest = stringifyJSON(newUserData);
        if(dataForTest === recentData) return;
        let lastData = recentData;
        console.log('\x1b[32mDONE: saveData\x1b[0m');
        recentData = dataForTest;
        let userStats = {
          tips: newUserData.tips,
          statistics: newUserData.statistics,
          settings: newUserData.settings,
          money: newUserData.money,
          taskObject: newUserData.taskObject, 
          broccoliKilled: newUserData.broccoliKilled,
          startedDate: newUserData.startedDate
        }
        globalUserStats = userStats;
        userStats = stringifyJSON(userStats);
        setElementToLocalStorage('userStats', userStats);
        let newData = {
          lastLevel: newUserData.lastLevel,
          lastLevelData: newUserData.lastLevelData,
          locations: newUserData.locations
        }
        newData = stringifyJSON(newData);
        setElementToLocalStorage(getGameProgressName(), newData);

        if(isScreenMode) return;

        if(__PLATFORM__ === 'yandex'){
          if (playerGame) {
            const state = {
              ...anotherLangDataForYandex,
              userStats: userStats,
              [getGameProgressName()]: newData,
              "prefferedLanguage": prefferedLanguage
            };
            anotherLangDataForYandex = state;
            playerGame.setData(state).then((ignored: any) => {}).catch(()=>{});
          }
        }else if(__PLATFORM__ === 'yt' && canUseYoutubeSDK){
          YT_DATA = {
            ...YT_DATA,
            userStats: userStats,
            [getGameProgressName()]: newData,
            "prefferedLanguage": prefferedLanguage
          };
          let jsoned = stringifyJSON(YT_DATA);
          console.log('try save yt data');
          // console.log('jsoned', jsoned);
          YSDK?.game?.saveData(jsoned).then(() => {
            console.log('save data success');
          }, (e: any) => {
            // Handle data save failure.
            console.error(e);
            // Send an error to YouTube when this happens.
            YSDK.health.logError();
          });
        } else if(__PLATFORM__ === 'gp'){
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
                'userStats',
                userStats
              );
              YSDK.player.set(
                'iq',
                newUserData.statistics.iq
              );
              YSDK.player.set(
                'prefferedLanguage',
                prefferedLanguage
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
    }else if(__PLATFORM__ === 'yt' && canUseYoutubeSDK){
      console.debug(`requestInterstitialAd() - rewarded`);
      switchOffAllMusic();
      YSDK?.ads?.requestInterstitialAd().then(() => {
        callback();
        switchOnAllMusic();
      }, (e: any) => {
        console.warn(e);
        switchOnAllMusic();
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
            },
            onError: function() {
              console.log('Ошибка при показе рекламы');
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
    }else if(__PLATFORM__ === 'yt' && canUseYoutubeSDK){
      console.debug(`requestInterstitialAd()`);
      switchOffAllMusic();
      YSDK?.ads?.requestInterstitialAd().then(() => {
        // Request succeeded (no guarantee an ad was shown).
        // Handle this case as needed.
        // Proceed with the game.
        switchOnAllMusic();
      }, (e: any) => {
        // Handle ad request failure.
        console.warn(e);
        // Proceed with the game.
        switchOnAllMusic();
      });
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
  }else if(__PLATFORM__ === 'mobile'){
    // addUserToRating(iq);
  }else if(__PLATFORM__ === 'yt' && canUseYoutubeSDK){
    YSDK?.engagement?.sendScore({ value: iq }).then(() => {
      console.log('send score success');
    }).catch((err: any) => {
      console.log('send score error', err);
    });
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

if(__PLATFORM__ === 'gd' || __PLATFORM__ === 'mobile'){
  gameLink = '';
}


function chooseLatestData(gp: any, localStorageUserData: any){
  //Если локальные данные дальше, чем серверные, то используем локальные
  try{
    if(localStorageUserData.lastLevel > gp.lastLevel || localStorageUserData.statistics.iq > gp.statistics.iq){
        gp = localStorageUserData;
    }else if(localStorageUserData.lastLevel === gp.lastLevel && localStorageUserData.statistics.iq === gp.statistics.iq){
      console.log('lastLevel same', localStorageUserData.lastLevel, gp.lastLevel);
      //Если уровень и IQ одинаковый, то используем локальные данные
      gp = localStorageUserData;
      // //Если оба уровня заполнены, то сравниваем заполненные буквы
      // if(localStorageUserData.lastLevelData && gp.lastLevelData){
      //   let filledLetters = Object.keys(localStorageUserData.lastLevelData.filledLetters);
      //   let filledLetters2 = Object.keys(gp.lastLevelData.filledLetters);
      //   if(filledLetters.length > filledLetters2.length){
      //     gp = localStorageUserData;
      //   }
      // } //Если локальные данные заполнены, а серверные нет, то используем локальные
      // else if(localStorageUserData.lastLevelData && !gp.lastLevelData){
      //   gp = localStorageUserData;
      // }
    }
  }catch(e){}

  return gp;
}

function setUserData(data: any){
  if(!data) return;
  data = JSON.parse(data);
  userData = data;
}
function setUserStats(data: any){
  if(!data) return;
  data = JSON.parse(data);
  globalUserStats = data;
}


function getDataYandex(){
  let gp = anotherLangDataForYandex[getGameProgressName()];
  if(gp){
    setUserData(gp);
    return;
  }
  userData = getUserDataFromLocalStorage();
}

function getDataYT(){
  let gp;
  if(YT_DATA){
    gp = YT_DATA[getGameProgressName()];
  }
  if(gp){
    setUserData(gp);
    return;
  }
  userData = getUserDataFromLocalStorage();
}

function getDataGP(){
  if(YSDK.player.has(getGameProgressName())){
    let newData = YSDK.player.get(getGameProgressName());
    if(newData){
      setUserData(newData);
      return;
    }
  }
  userData = getUserDataFromLocalStorage();
}

export function initPlayer(ysdk: any) {
    ysdk.getPlayer({ scopes: true }).then((_player: any) => {
        console.log('INIT PLAYER');
        // Игрок авторизован.
        playerGame = _player;
        // console.log('playerGame', playerGame);

        playerGame.getData().then((data: any) => {
            let prefLang = undefined;
            console.log(data);
            if(data['prefferedLanguage']){
              prefLang = data['prefferedLanguage'];
              prefferedLanguage = prefLang;
              mainLanguage = prefferedLanguage as string;
            }
            setUserStats(data['userStats']);
            let gp = data[getGameProgressName()];
            anotherLangDataForYandex = {...data};
            setUserData(gp);
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
  }else if(__PLATFORM__ === 'yt' && canUseYoutubeSDK){
    console.log('yt game ready');
    YSDK?.game?.gameReady();
  }
}


function changeLanguage(lang: string){
  mainLanguage = detectAppLanguage(lang);
}

export function switchOffAllMusic(){
  musicStoppedByAdv = true;
  switchOffMainMusic();
}
export function switchOnAllMusic(){
  if(!canPlaySound) return;
  switchOnMainMusic();
  musicStoppedByAdv = false;
}

/*


YANDEX


*/
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
}
/*


GAMEPUSH


*/

else if(__PLATFORM__ === 'gp') {
  console.log('gp playform init');
  // @ts-ignore
  window.onGPInit = async (gp) => {
    console.log('gp init');
    YSDK = gp;
    if(__PLATFORM__ === 'gp'){
      changeLanguage(gp.language);
    }
    
    if(gp?.platform?.type === 'VK'){
      gameLink = 'https://vk.com/app53847636';
    }else if(gp?.platform?.type === 'OK'){
      gameLink = 'https://ok.ru/game/cryptogram';
    }else{
      gameLink = ''; 
    }
    // Wait while the player syncs with the server
    await gp.player.ready;

    let prefLang = undefined;
    if(gp.player.has('prefferedLanguage')){
      prefLang = gp.player.get('prefferedLanguage');
      if(prefLang){
        prefferedLanguage = prefLang;
        mainLanguage = prefferedLanguage as string;
      }
      console.log('prefLang', prefLang);
    }
    if(gp.player.has('userStats')){
      let usStats = gp.player.get('userStats');
      if(usStats){
        setUserStats(usStats);
        console.log('usStats', usStats);
      }
    }
    getDataGP();
    createApp();

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
      switchOffAllMusic();
    });
    // Включили звук
    gp.sounds.on('unmute', () => {
      switchOnAllMusic();
    });


    //Sticky
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
}
/*



MOBILE



*/

else if(__PLATFORM__ === 'mobile') {
  console.log('mobile playform init');
  if(!prefferedLanguage){
    changeLanguage(getLang());
  }
  gameLink = 'https://play.google.com/store/apps/details?id=com.witgames.cryptogramgame';
  createApp();
    
}
/*



YOUTUBE



*/
else if(__PLATFORM__ === 'yt'){
  console.log('yt platform init');
  console.log(ytgame);
  YSDK = ytgame;
  gameLink = '';
  const inPlayablesEnv = typeof ytgame !== "undefined" && ytgame.IN_PLAYABLES_ENV;
  if(!inPlayablesEnv){
    createApp();
    canUseYoutubeSDK = false;
  }else{
    canUseYoutubeSDK = true;
    ytgame.game.firstFrameReady();
    async function initYT(){
      try {
        //Выбор языка
        const language = await ytgame.system.getLanguage();
        console.log('language', language);
        changeLanguage(language);
        //Загрузка данных из игры
        let data = await ytgame.game.loadData();
        console.log('data', data);
        if(data && data !== ''){
          data = JSON.parse(data);
          // console.log('parsed data', data);
          try{
            data = Object.fromEntries(
              Object.entries(data).filter(([key]) => !Number.isFinite(Number(key)))
            );
            if(data['prefferedLanguage']){
              prefferedLanguage = data['prefferedLanguage'];
              mainLanguage = prefferedLanguage as string;
            }
            if(data['userStats']){
              setUserStats(data['userStats']);
            }
            let gp = data[getGameProgressName()];
            if(gp){
              setUserData(gp);
            }
            YT_DATA = {...data};
          }catch(e){}
  
        }
        // Handle the audio changing state from YouTube.
        if (ytgame.system.isAudioEnabled()) {
          canPlaySound = true;
        } else {
          canPlaySound = false;
        }
        ytgame.system.onAudioEnabledChange((isAudioEnabled: boolean) => {
          console.debug(`onAudioEnabledChange() - isAudioEnabled: [${isAudioEnabled}]`);
          if (isAudioEnabled) {
            canPlaySound = true;
            switchOnAllMusic();
            window.dispatchEvent(new Event('musicSwitchYT'));
          } else if (!isAudioEnabled) {
            canPlaySound = false;
            switchOffAllMusic();
          }
        });
        ytgame.system.onPause(() => {
          switchOffAllMusic();
        });
        ytgame.system.onResume(() => {
          switchOnAllMusic();
        });
      } catch (error) {
        console.log('get Yt game data error', error);
      }
      createApp();
    }
    initYT();
  }
} else {
  createApp();
}