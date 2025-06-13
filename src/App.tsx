import React, { useEffect, useState } from 'react'
import Game from './components/Game'
import Menu from './components/Menu'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import './AppTransition.css'
import { usePageActiveTimer } from './components/PageTimer'
import { appIsReady, getServerTime, saveData, tryPlaySound } from './main'
import { copyObject, getTasks } from './tasks'
import { LevelData } from './levels'
import Shop from './components/modalComponents/Shop'
import ShopMoney from './components/modalComponents/ShopMoney'
let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if(iOS){
  document.documentElement.addEventListener('gesturestart', function (event) {
    event.preventDefault();
  }, false);
}


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

const App: React.FC<AppProps> = ({allUserData}) => {
  const [showGame, setShowGame] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [showShopMoney, setShowShopMoney] = useState(false)

  const [showRewardTimer, setShowRewardTimer] = useState(0)

  const { getSeconds } = usePageActiveTimer()
  const [userData, setUserData] = useState<UserDataProps>(allUserData)
  const [previousTasksData, setPreviousTasksData] =
  useState<TaskObjectProps>(userData.taskObject ? copyObject(userData.taskObject) : getTasks(userData.statistics.iq))
  const [previousIQ, setPreviousIQ] = useState<number>(userData.statistics.iq)

  const playSound = (soundName: string) => {
    tryPlaySound(soundName);
  }

  const addPreviousIQ = () => {
    setPreviousIQ((prev) => {
      return prev + 1;
    });
  }
  const copyFunction = (levelData: LevelData) => {
    try{
     let text = levelData.text + '\n' + levelData.name + '\n' + levelData.desc;
     navigator.clipboard.writeText(text)
     .then(() => {
      console.log("Скопировано!")
      setShowCopied(true)
      setTimeout(() => {
        setShowCopied(false)
      }, 1500)
     })
     .catch(err => {console.error("Ошибка копирования:", err)})
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
      let dateNow = new Date().getTime();
      if(dateNow >= taskObject.dateToGetNewTask + taskObject.time){
        taskObject = getTasks(iq);
        setPreviousTasksData(copyObject(taskObject));
      }
    }
    return taskObject;
  }
  useEffect(() => {
    // saveData(userData); 
    console.log('userData change', userData);
  }, [userData])
  //Вызываем один раз при рендере компонента
  useEffect(() => {
    appIsReady();
    if(!userData.taskObject){
      console.log('set taskObject', previousTasksData);
      setUserData({...userData, taskObject: copyObject(previousTasksData)})
    }
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
        {showGame ? (
          <Game
              onMenu={() => setShowGame(false)}
              userData={userData}
              setUserData={setUserData}
              getGameSeconds={getSeconds}
              copyFunction={copyFunction}
              testTasks={testTasks}
              playSound={playSound}
            />
        ) : (
          <Menu
              onStart={() => setShowGame(true)}
              userData={userData}
              setUserData={setUserData}
              getGameSeconds={getSeconds}
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
               />
          )}
          {showShopMoney && (
               <ShopMoney
                    userData={userData}
                    onClose={() => setShowShopMoney(false)}
                    setUserData={setUserData}
               />
          )}
        </div>
      </CSSTransition>
    </SwitchTransition>
  )
}

export default App
