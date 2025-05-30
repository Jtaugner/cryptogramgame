import React, { useEffect, useState } from 'react'
import Game from './components/Game'
import Menu from './components/Menu'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import './AppTransition.css'
import { usePageActiveTimer } from './components/PageTimer'
import { appIsReady, saveData } from './main'
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
  atLeastOneError: boolean
};

export type UserDataProps = {
  lastLevel: number,
  lastLevelData: LevelDataProps | null,
  tips: number,
  statistics: StatisticsProps,
  settings: SettingsProps,
  money: number
}



export type AppProps = {
  allUserData: UserDataProps
}

const App: React.FC<AppProps> = ({allUserData}) => {
  const [showGame, setShowGame] = useState(false)
  const { getSeconds, reset } = usePageActiveTimer()
  const [userData, setUserData] = useState<UserDataProps>(allUserData)
  useEffect(() => {
    saveData(userData);
  }, [userData])
  useEffect(() => {
    console.log('time:', getSeconds());
  }, [showGame])
  //Вызываем один раз при рендере компонента
  useEffect(() => {
    appIsReady();
  }, [])

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        key={showGame ? 'game' : 'menu'}
        timeout={200}
        classNames="fade"
      >
        <div style={{height: '100%', width: '100%'}}>
        {showGame ? (
          <Game
           onMenu={() => setShowGame(false)}
           userData={userData}
           setUserData={setUserData}
            />
        ) : (
          <Menu onStart={() => setShowGame(true)} userData={userData} setUserData={setUserData}/>
        )}
        </div>
        
      </CSSTransition>
    </SwitchTransition>
  )
}

export default App
