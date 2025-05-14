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
const App = () => {
  const [showGame, setShowGame] = useState(false)
  const [userData, setUserData] = useState<{ 
    iq: number
    lastLevel: number
    lastLevelData: object,
    tips: number
  }>({
    iq: 90,
    lastLevel: 0,
    lastLevelData: {},
    tips: 5
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
          <Menu onStart={() => setShowGame(true)} userData={userData}/>
        )}
        </div>
        
      </CSSTransition>
    </SwitchTransition>
  )
}

export default App
