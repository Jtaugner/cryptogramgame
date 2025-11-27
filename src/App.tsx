import React, { useEffect, useRef, useState } from 'react'
import Game from './components/Game'
import Menu from './components/Menu'
// @ts-ignore
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import './AppTransition.css'
import { usePageActiveTimer } from './components/PageTimer'
import { appIsReady, consumePurchase, getServerTime, makePurchaseSDK, setNotShowAdv, payments, saveData, shopItemCount, shopItems, tryPlaySound, setUserToLeaderboard, tryToAddUserToLeaderboard, params, gameLink, isPurchaseAvailable, getLocationByDate } from './main'
import { copyObject, getTasks } from './tasks'
import { useBackButtonClick } from './hooks/useBackButtonClick'
import { LevelData, namesDescs } from './levels'
import Shop from './components/modalComponents/Shop'
import ShopMoney from './components/modalComponents/ShopMoney'
import { stopSound, switchOffMainMusic } from './sounds'
import { changeLanguage } from './i18n'
import { useTranslation } from 'react-i18next'
import Calendar from './components/Calendar/Calendar'
import { useAnimationTransition } from './hooks/useAnimationTransition'
import { getClassForLocationBackground } from './components/Calendar/Calendar'
// @ts-ignore
let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if (iOS) {
  document.documentElement.addEventListener('gesturestart', function (event) {
    event.preventDefault();
  }, false);
}

document.oncontextmenu = function (e) {
  stopEvent(e);
}
function stopEvent(event) {
  if (event.preventDefault !== undefined)
    event.preventDefault();
  if (event.stopPropagation !== undefined)
    event.stopPropagation();
}

export function scrollIntoViewY(container: any, element: any, options: any = {}) {
  try {
    const { behavior = 'auto', align = 'start' } = options;

    const elTop = element.offsetTop - container.offsetTop;
    let top = container.scrollTop;

    switch (align) {
      case 'center':
        top = elTop - (container.clientHeight / 2 - element.clientHeight / 2);
        break;
      case 'end':
        top = elTop - (container.clientHeight - element.clientHeight);
        break;
      case 'nearest':
        if (elTop < container.scrollTop) {
          top = elTop; // элемент выше видимой области
        } else if (elTop + element.clientHeight > container.scrollTop + container.clientHeight) {
          top = elTop - (container.clientHeight - element.clientHeight); // элемент ниже
        }
        break;
      case 'start':
      default:
        top = elTop;
    }
    console.log('scrollIntoViewY', top);

    container.scrollTo({ top, behavior });
  } catch (e) {

  }

}



const clickSoundElements = [
  'menu-bottom-icon', 'menu-settings-btn', 'blackout',
  'moneyCount', 'modal-settings-row', 'game-header-type-icon',
  'modal-collection-book-icon', 'modal-shop-row-price',
  'collection-category-buttons-button', 'modal-close',
  'rules-button', 'menu-tips-btn', 'calendar__day'
]


export type StatisticsProps = {
  iq: number;
  levels: number;
  letters: number;
  words: number;
  perfectLevels: number;
  errors: number;
  avgTime: number;
  bestTime: number;
};

export type SettingsProps = {
  sounds: boolean,
  music: boolean,
  arrowLeft: boolean,
  autoScroll: boolean
};

export type LevelDataProps = {
  text: string,
  numbers: number[],
  hiddenIndexes: number[],
  filledLetters: Record<number, string>,
  completedNumbers: Set<number>,
  errors: number,
  isKeyboardBlocked: boolean,
  time: number,
  atLeastOneError: boolean,
  keyboardBlockedTimes: number
};

export type TaskObjectProps = {
  tasks: {
    [key: string]: {
      now: number,
      goal: number,
      taskCompleted: boolean
    }
  },
  dateToGetNewTask: number,
  time: number
} | null

export type UserDataProps = {
  broccoliKilled: string,
  startedDate: string,
  lastLevel: number,
  lastLevelData: LevelDataProps | null,
  tips: number,
  statistics: StatisticsProps,
  settings: SettingsProps,
  money: number,
  taskObject: TaskObjectProps,
  locations: {
    [key: string]: {
      level: number,
      data: LevelDataProps | null,
      currentDate: string,
      doneForToday: boolean
    } | {
      completedLevels: number[],
      currentLevels: number[],
      currentLevelsData: Record<number, LevelDataProps>
    }
  }
}



export type AppProps = {
  allUserData: UserDataProps,
  mainLanguage: string
}

let musicStarted = false;
let firstClickWasMade = false;
let handlersAdded = false;

const App: React.FC<AppProps> = ({ allUserData, mainLanguage }) => {
  const { t } = useTranslation();
  const [showGame, setShowGame] = useState(allUserData.lastLevel === 0)
  const [showCopied, setShowCopied] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [showShopMoney, setShowShopMoney] = useState(false)
  const [gameLanguage, setGameLanguage] = useState(mainLanguage)
  const [gameLocation, setGameLocation] = useState('main')
  const [gameLocationData, setGameLocationData] = useState({
    location: 'main',
    level: 0
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarLocation, setCalendarLocation] = useState(getLocationByDate());
  const [calendarLevelDone, setCalendarLevelDone] = useState(false)
  const [calendarWasOpenedFromGame, setCalendarWasOpenedFromGame] = useState(false)
  const calendarMounted = useAnimationTransition(isCalendarOpen, 300, showGame || calendarWasOpenedFromGame);
  const [coinAnimation, setCoinAnimation] = useState(false);

  const openCalendar = (location: string = getLocationByDate()) => {
    setIsCalendarOpen(true);
    setCalendarLocation(location);
    setCalendarWasOpenedFromGame(false);
  }

  const [showRewardTimer, setShowRewardTimer] = useState(0)
  const [dailyDone, setDailyDone] = useState(false)

  const { getSeconds } = usePageActiveTimer()
  const [userData, setUserData] = useState<UserDataProps>(allUserData)
  const [previousTasksData, setPreviousTasksData] =
    useState<TaskObjectProps>(userData.taskObject ? copyObject(userData.taskObject) : getTasks(userData.statistics.iq))
  const [previousIQ, setPreviousIQ] = useState<number>(userData.statistics.iq)
  const soundsRef = useRef(userData.settings.sounds);

  const getGameSeconds = () => {
    return getSeconds(true);
  }

  const openCalendarLevel = (location: string, level: number) => {
    setGameLocation('calendar');
    setIsCalendarOpen(false);
    setGameLocationData({
      location: location,
      level: level
    })
    setShowGame(true);
    playSound('changeWindow')
  }

  const openShopMoney = () => {
    if (!isPurchaseAvailable) {
      return;
    }
    setShowShopMoney(true);
  }

  const backButtonClick = () => {
    let windowClosed = false;
    setShowShopMoney(c => {
      if (c) {
        windowClosed = true;
      }
      return false;
    })
    if (!windowClosed) {
      setShowShop(false);
    }
  };
  useBackButtonClick(backButtonClick);





  const addMoney = (id: string) => {
    playSound('addMoney');
    params({ 'makePurchase': id });
    if (id === 'remove_ads') {
      setNotShowAdv();
      return;
    }
    for (let i = 0; i < shopItems.length; i++) {
      if (shopItems[i].id === id) {
        console.log('addMoney');
        setUserData({
          ...userData,
          money: userData.money + shopItemCount[id]
        });
        break;
      }
    }
  }
  const makePurchase = (id: string) => {
    makePurchaseSDK(id, addMoney);
  }

  const playSound = (soundName: string, cantPlaySound?: boolean) => {
    if (soundName === 'music') {
      if (userData.settings.music) {
        tryPlaySound(soundName);
      }
    }
    if (cantPlaySound !== undefined) {
      if (!cantPlaySound) {
        tryPlaySound(soundName);
      }
    } else if (userData.settings.sounds) {
      tryPlaySound(soundName);
    }


  }
  useEffect(() => {
    if (!firstClickWasMade) {
      return;
    }
    if (userData.settings.music) {
      playSound('music');
    } else {
      stopSound('music');
    }
  }, [userData.settings.music])

  const addPreviousIQ = () => {
    console.log('addPreviousIQ', gameLocation);
    if(gameLocation !== 'calendar') {
      playSound('getIQ');
    }
    setPreviousIQ((prev) => {
      let newIQ = prev + 1;
      if(newIQ > userData.statistics.iq){
        newIQ = userData.statistics.iq;
      }
      return newIQ;
    });
  }
  useEffect(() => {
    if(showGame){
      setPreviousIQ(userData.statistics.iq);
    }
  }, [showGame])
  useEffect(() => {
    if(!isCalendarOpen){
      setPreviousIQ(userData.statistics.iq);
    }
  }, [isCalendarOpen])

  const copyFunction = (levelData: {text: string, name: string, desc: string}) => {
    params({ 'copyQuote': 1 });
    try {
      let desc = namesDescs[levelData.name as keyof typeof namesDescs] || levelData.desc;
      let text = levelData.text + '\n\n' + levelData.name + ' — ' + desc + '\n' + gameLink;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(() => {
            console.log("Скопировано!")
            setShowCopied(true)
            setTimeout(() => {
              setShowCopied(false)
            }, 1500)
          })
          .catch(err => { oldCopyText() })
      } else {
        oldCopyText();
      }
      function oldCopyText() {
        // Старый способ (создание временного input)
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // избегаем прокрутки к элементу
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
          document.execCommand('copy');
          setShowCopied(true)
          setTimeout(() => {
            setShowCopied(false)
          }, 1500)
        } catch (err) {
          console.error('Ошибка копирования:', err);
        }

        document.body.removeChild(textarea);
      }

    } catch (e) { }
  }
  const testTasks = (taskObject: any, iq: number) => {
    const keys = Object.keys(taskObject.tasks);
    if (taskObject.dateToGetNewTask === 0) {
      let isAllCompleted = true;
      keys.forEach((key: any) => {
        if (!taskObject.tasks[key].taskCompleted) {
          isAllCompleted = false;
        }
      });
      //Если все задания выполнены, то устанавливаем время для получения нового задания
      if (isAllCompleted) {
        taskObject.dateToGetNewTask = getServerTime();
      }
    } else {
      let dateNow = getServerTime();
      if (dateNow >= taskObject.dateToGetNewTask + taskObject.time) {
        taskObject = getTasks(iq);
        setPreviousTasksData(copyObject(taskObject));
      }
    }
    return taskObject;
  }
  useEffect(() => {
    saveData(userData);
  }, [userData])
  useEffect(() => {
    soundsRef.current = userData.settings.sounds;
  }, [userData.settings.sounds])

  //Добавляем в рейтинг
  useEffect(() => {
    tryToAddUserToLeaderboard(userData.statistics.iq);
  }, [userData.statistics.iq])

  //Вызываем один раз при рендере компонента
  useEffect(() => {
    appIsReady();
    if (payments) {
      if (__PLATFORM__ === 'yandex') {
        payments.getPurchases().then((purchases: any) =>
          purchases.forEach((purchase: any) => {
            if (purchase.productID === 'remove_ads') {
              setNotShowAdv()
            } else {
              addMoney(purchase.productID);
              consumePurchase(purchase);
            }
          }));
      } else if (__PLATFORM__ === 'gp' || __PLATFORM__ === 'mobile') {
        payments.purchases.forEach((purchase: any) => {
          console.log('last purchase', purchase);
          if (purchase.tag === 'remove_ads') {
            setNotShowAdv()
          } else {
            addMoney(purchase.tag);
            consumePurchase(purchase.tag);
          }
        });
      }
    }
    if (!userData.taskObject) {
      console.log('set taskObject', previousTasksData);
      setUserData({ ...userData, taskObject: copyObject(previousTasksData) })
    }
    if (userData?.lastLevel === 0) {
      params({ 'firstStart': 1 });
    }
    if (!handlersAdded) {
      console.log('ADDHANDLERS');
      handlersAdded = true;
      const clickHandler = (e) => {
        firstClickWasMade = true;
        if (userData.settings.music && !musicStarted) {
          playSound('music');
          musicStarted = true;
        }
        try {
          for (let i = 0; i < clickSoundElements.length; i++) {
            if (e?.target?.className?.indexOf(clickSoundElements[i]) !== -1) {
              // console.log('clickSoundElements', soundsRef.current);
              playSound('click', !soundsRef.current);
            }
          }
        } catch (err) {

        }

      }
      window.addEventListener('click', clickHandler);
    }
    try {
      changeLanguage(mainLanguage);
    } catch (e) {
      console.log('error changeLanguage', e);
    }
  }, [])

  function getWrapperClasses(){
    if(gameLocation === 'calendar' || isCalendarOpen){
      return getClassForLocationBackground();
    }
    return '';
  }

  return (
    <div className={`app-wrapper ${getWrapperClasses()}`} style={{ height: '100%', width: '100%', position: 'relative' }}>
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={showGame ? 'game' : 'menu'}
          timeout={200}
          classNames="fade"
        >
          <div
            style={{ height: '100%', width: '100%', position: 'relative' }}

          >
            {showCopied && <div className="text-copied">{t('copied')}</div>}
            {(showShop || showShopMoney || !showGame) &&
              <div
                className={`moneyCount ${showShop || showShopMoney ? 'moneyCount_big' : ''}`}
                onClick={openShopMoney}
              >
                <div className={`modal-shop-row-price-icon ${coinAnimation ? 'jumping-icon' : ''}`}></div>
                {userData.money}
              </div>
            }

            {showGame ? (
              <Game
                onMenu={() => {
                  setShowGame(false)
                  playSound('changeWindow')
                  if (gameLocation === 'calendar') {
                    setIsCalendarOpen(true);
                    setCalendarWasOpenedFromGame(true);
                  }
                }}
                userData={userData}
                setUserData={setUserData}
                getGameSeconds={getGameSeconds}
                copyFunction={copyFunction}
                testTasks={testTasks}
                setShowShop={setShowShop}
                openShopMoney={openShopMoney}
                playSound={playSound}
                gameLanguage={gameLanguage}
                gameLocation={gameLocation}
                setDailyDone={setDailyDone}
                gameLocationData={gameLocationData}
                setCalendarLevelDone={setCalendarLevelDone}
              />
            ) : (
              <Menu
                onStart={() => {
                  setShowGame(true)
                  // setGameLocation('main');
                  setIsCalendarOpen(false);
                  playSound('changeWindow')
                }}
                userData={userData}
                setUserData={setUserData}
                getGameSeconds={getGameSeconds}
                previousTasksData={previousTasksData}
                setPreviousTasksData={setPreviousTasksData}
                previousIQ={previousIQ}
                addPreviousIQ={addPreviousIQ}
                copyFunction={copyFunction}
                testTasks={testTasks}
                showShop={showShop}
                showShopMoney={showShopMoney}
                setShowShop={setShowShop}
                openShopMoney={openShopMoney}
                playSound={playSound}
                gameLanguage={gameLanguage}
                setGameLocation={setGameLocation}
                dailyDone={dailyDone}
                setDailyDone={setDailyDone}
                openCalendar={openCalendar}
                setCoinAnimation={setCoinAnimation}
              />
            )}
            {showShop && (
              <Shop
                userData={userData}
                onClose={() => setShowShop(false)}
                openShopMoney={openShopMoney}
                setUserData={setUserData}
                showRewardTimer={showRewardTimer}
                setShowRewardTimer={setShowRewardTimer}
                playSound={playSound}
              />
            )}
            {showShopMoney && (
              <ShopMoney
                onClose={() => { setShowShopMoney(false) }}
                makePurchase={makePurchase}
                isShopOpened={showShop}
              />
            )}
            {calendarMounted && (
              <Calendar
                isCalendarOpen={isCalendarOpen}
                noOpenAnimation={showGame || calendarWasOpenedFromGame}
                userData={userData}
                setUserData={setUserData}
                onClose={() => setIsCalendarOpen(false)}
                calendarLocation={calendarLocation}
                setCalendarLocation={setCalendarLocation}
                openCalendarLevel={openCalendarLevel}
                calendarLevelDone={calendarLevelDone}
                setCalendarLevelDone={setCalendarLevelDone}
                playSound={playSound}
                copyFunction={copyFunction}
              />
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>

  )
}

export default App
