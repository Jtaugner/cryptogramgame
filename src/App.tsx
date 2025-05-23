import React, { useState } from 'react'
import Game from './components/Game'
import Menu from './components/Menu'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import './AppTransition.css'
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
  lettersPerMinute: number;
};

export type SettingsProps = {
  sounds: boolean,
  music: boolean
};

export type UserDataProps = {
  lastLevel: number
  lastLevelData: object
  tips: number,
  statistics: StatisticsProps,
  settings: SettingsProps,
  money: number
}


const App = () => {
  const [showGame, setShowGame] = useState(false)
  const [userData, setUserData] = useState<UserDataProps>({
    lastLevel: 0,
    lastLevelData: {},
    tips: 5,
    statistics: {
      iq: 0,
      levels: 1,
      letters: 12,
      words: 123,
      perfectLevels: 4,
      errors: 421,
      avgTime: 123,
      bestTime: 33,
      lettersPerMinute: 21
    },
    settings: {
      sounds: true,
      music: true
    },
    money: 582
  })

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        key={showGame ? 'game' : 'menu'}
        timeout={200}
        classNames="fade"
      >
        <div>
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
