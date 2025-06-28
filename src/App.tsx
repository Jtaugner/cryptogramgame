import React, { useEffect, useState } from 'react'
import Game from './components/Game'
import Menu from './components/Menu'
// @ts-ignore
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import './AppTransition.css'
import { usePageActiveTimer } from './components/PageTimer'
import { appIsReady, consumePurchase, getServerTime, makePurchaseSDK, setNotShowAdv, payments, saveData, shopItemCount, shopItems, tryPlaySound, setUserToLeaderboard, tryToAddUserToLeaderboard, params, gameLink } from './main'
import { copyObject, getTasks } from './tasks'
import { LevelData } from './levels'
import Shop from './components/modalComponents/Shop'
import ShopMoney from './components/modalComponents/ShopMoney'
import { stopSound, switchOffMainMusic } from './sounds'
// @ts-ignore
let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if(iOS){
  document.documentElement.addEventListener('gesturestart', function (event) {
    event.preventDefault();
  }, false);
}

document.oncontextmenu = function(e){
  stopEvent(e);
}
function stopEvent(event){
  if(event.preventDefault !== undefined)
      event.preventDefault();
  if(event.stopPropagation !== undefined)
      event.stopPropagation();
}


const clickSoundElements =[
  'menu-bottom-icon', 'menu-settings-btn', 'blackout',
  'moneyCount', 'modal-settings-row', 'game-header-type-icon',
  'modal-collection-book-icon', 'modal-shop-row-price',
  'collection-category-buttons-button', 'modal-close',
  'rules-button', 'menu-tips-btn'
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
  arrowLeft: boolean
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
  lastLevel: number,
  lastLevelData: LevelDataProps | null,
  tips: number,
  statistics: StatisticsProps,
  settings: SettingsProps,
  money: number,
  taskObject: TaskObjectProps
}



export type AppProps = {
  allUserData: UserDataProps
}

let musicStarted = false;

const App: React.FC<AppProps> = ({allUserData}) => {
  const [showGame, setShowGame] = useState(allUserData.lastLevel === 0)
  const [showCopied, setShowCopied] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [showShopMoney, setShowShopMoney] = useState(false)

  const [showRewardTimer, setShowRewardTimer] = useState(0)

  const { getSeconds } = usePageActiveTimer()
  const [userData, setUserData] = useState<UserDataProps>(allUserData)
  const [previousTasksData, setPreviousTasksData] =
  useState<TaskObjectProps>(userData.taskObject ? copyObject(userData.taskObject) : getTasks(userData.statistics.iq))
  const [previousIQ, setPreviousIQ] = useState<number>(userData.statistics.iq)

  const getGameSeconds = () => {
    return getSeconds(true);
  }


  const addMoney = (id: string) => {
    playSound('addMoney');
    params({'makePurchase': id});
    if(id === 'remove_ads'){
      setNotShowAdv();
      return;
    }
    for(let i = 0; i < shopItems.length; i++){
        if(shopItems[i].id === id){
            console.log('addMoney');
            setUserData({...userData,
               money: userData.money + shopItemCount[id]});
            break;
        }
    }
  }
  const makePurchase = (id: string) => {
    makePurchaseSDK(id, addMoney);
  }

  const playSound = (soundName: string) => {
    if(soundName === 'music'){
      if(userData.settings.music){
        tryPlaySound(soundName);
      }
    }else if(userData.settings.sounds){
      tryPlaySound(soundName);
    }
  }
  useEffect(() => {
    if(userData.settings.music){
      playSound('music');
    }else{
      stopSound('music');
    }
  }, [userData.settings.music])

  const addPreviousIQ = () => {
    setPreviousIQ((prev) => {
      return prev + 1;
    });
  }
  const copyFunction = (levelData: LevelData) => {
    try{
     let text = levelData.text + '\n\n' + levelData.name + ' — ' + levelData.desc + '\n' + gameLink;
     if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
      .then(() => {
       console.log("Скопировано!")
       setShowCopied(true)
       setTimeout(() => {
         setShowCopied(false)
       }, 1500)
      })
      .catch(err => {oldCopyText()})
    }else{
      oldCopyText();
    } 
    function oldCopyText(){
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

    }catch(e){}
  }
  const testTasks = (taskObject: any, iq: number) => {
    const keys = Object.keys(taskObject.tasks);
    if(taskObject.dateToGetNewTask === 0){
        let isAllCompleted = true;
        keys.forEach((key: any) => {
          if(!taskObject.tasks[key].taskCompleted){
            isAllCompleted = false;
          }
        });
        //Если все задания выполнены, то устанавливаем время для получения нового задания
        if(isAllCompleted){
          taskObject.dateToGetNewTask = getServerTime();
        }
    }else{
      let dateNow = getServerTime();
      if(dateNow >= taskObject.dateToGetNewTask + taskObject.time){
        taskObject = getTasks(iq);
        setPreviousTasksData(copyObject(taskObject));
      }
    }
    return taskObject;
  }
  useEffect(() => {
    saveData(userData); 
    console.log('userData change', userData.money);
  }, [userData])

  //Добавляем в рейтинг
  useEffect(() => {
    tryToAddUserToLeaderboard(userData.statistics.iq);
  }, [userData.statistics.iq])

  //Вызываем один раз при рендере компонента
  useEffect(() => {
    appIsReady();
    if(payments){
      payments.getPurchases().then((purchases: any) => 
        purchases.forEach((purchase: any)=>{
          if(purchase.productID === 'remove_ads'){
            setNotShowAdv()
          }else{
            addMoney(purchase.productID);
            consumePurchase(purchase);
          }
          
      }));
    }
    if(!userData.taskObject){
      console.log('set taskObject', previousTasksData);
      setUserData({...userData, taskObject: copyObject(previousTasksData)})
    }
    if(userData?.lastLevel === 0){
      params({'firstStart': 1});
    }
    window.addEventListener('click', (e) => {
      if(userData.settings.music && !musicStarted ){
        playSound('music');
        musicStarted = true;
      }
      try{
        console.log(e.target.className);
        for(let i = 0; i < clickSoundElements.length; i++){
          if(e?.target?.className?.indexOf(clickSoundElements[i]) !== -1){
            playSound('click');
          }
        }
      }catch(err){

      }

    })
  }, [])
  useEffect(() => {
    console.log('previousTasksData change', previousTasksData);
  }, [previousTasksData])

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        key={showGame ? 'game' : 'menu'}
        timeout={200}
        classNames="fade"
      >
        <div style={{height: '100%', width: '100%'}}>
          {showCopied && <div className="text-copied">Скопировано</div>}
        {(showShop || showShopMoney || !showGame) &&
          <div
             className={`moneyCount ${showShop || showShopMoney ? 'moneyCount_big' : ''}`}
             onClick={() => setShowShopMoney(true)}
          >
             <div className="modal-shop-row-price-icon"></div>
             {userData.money}
          </div>
        }

        {showGame ? (
          <Game
              onMenu={() => {
                setShowGame(false)
                playSound('changeWindow')
              }}
              userData={userData}
              setUserData={setUserData}
              getGameSeconds={getGameSeconds}
              copyFunction={copyFunction}
              testTasks={testTasks}
              setShowShop={setShowShop}
              setShowShopMoney={setShowShopMoney}
              playSound={playSound}
            />
        ) : (
          <Menu
              onStart={() => {
                setShowGame(true)
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
              setShowShopMoney={setShowShopMoney}
              playSound={playSound}
             />
        )}
          {showShop && (
               <Shop
                    userData={userData}
                    onClose={() => setShowShop(false)}
                    openShopMoney={() => setShowShopMoney(true)}
                    setUserData={setUserData}
                    showRewardTimer={showRewardTimer}
                    setShowRewardTimer={setShowRewardTimer}
                    playSound={playSound}
               />
          )}
          {showShopMoney && (
               <ShopMoney
                    onClose={() => {setShowShopMoney(false)}}
                    makePurchase={makePurchase}
                    isShopOpened={showShop}
               />
          )}
        </div>
      </CSSTransition>
    </SwitchTransition>
  )
}

export default App
