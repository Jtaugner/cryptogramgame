import { useState, useEffect, useRef, useCallback } from 'react'
import Keyboard from './Keyboard'
import Phrase from './Phrase'
import './Game.css'
import ProgressCircle from '../ProgressCircle'
import { countWordsWithHiddenLetters, levels } from '../levels'
import { usePageActiveTimer } from './PageTimer'
import { UserDataProps, LevelDataProps } from '../App'
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import Settings from './modalComponents/Settings'
import Tip from './modalComponents/Tip'
import { LevelData, formatTime} from '../levels'
import { showAdv } from '../main'
import { getMinutesFromSeconds } from '../tasks'

interface GameProps {
  onMenu: () => void
  userData: UserDataProps
  setUserData: (userData: UserDataProps) => void
  getGameSeconds: () => number
}

const cancelBlockPrice = 1;
let realLevelTime = 0;

const Game: React.FC<GameProps> = ({ onMenu, userData, setUserData, getGameSeconds }) => { 
  const [level, setLevel] = useState(userData.lastLevel)
  const [isLevelCompleted, setIsLevelCompleted] = useState(false)
  const [isShowSettings, setIsShowSettings] = useState(false)
  const [isTipSelecting, setIsTipSelecting] = useState(false)
  const [showPlayersPassedLevel, setShowPlayersPassedLevel] = useState(false)
  const [errors, setErrors] = useState(0)
  const [blockedTime, setBlockedTime] = useState(0)
  const [notShowKeyboard, setNotShowKeyboard] = useState(false)
  const [blockedTimeTimer, setBlockedTimeTimer] = useState(0)
  const [glowScreenAnimation, setGlowScreenAnimation] = useState(false)
  const [errorScreenAnimation, setErrorScreenAnimation] = useState(false)
  const [phraseData, setPhraseData] = useState<LevelDataProps>()
  const [inactiveKeys, setInactiveKeys] = useState<Set<string>>(new Set())
  const [levelData, setLevelData] = useState<LevelData>(levels[level]);
  const phraseRef = useRef<{ handleKeyPress: (key: string) => void, updatePhrase: (data: LevelDataProps) => void, getNextEmptyIndex: (getPrevious: boolean) => void }>(null)

  //Время
  const { getSeconds, reset } = usePageActiveTimer()
  const [levelTime, setLevelTime] = useState(0)


  const getLevelTime = () => {
    return getSeconds() + levelTime;
  }



  const updateLastLevelData = (newLevelData: object, levelCompleted: boolean = false) => {
    if(levelCompleted){
      //Для статистики
      const newLetters = levelData ? levelData.hiddenIndexes.length : 0;
      const newWords = levelData ? countWordsWithHiddenLetters(levelData) : 0;
      const levelWithoutMistake = userData.lastLevelData ? !userData.lastLevelData.atLeastOneError : false;
      const passedLevels = userData.statistics.levels + 1;
      const avgTime = (userData.statistics.avgTime * userData.statistics.levels + realLevelTime) / (passedLevels);
      let bestTime = Math.min(userData.statistics.bestTime, realLevelTime);
      if(bestTime === 0) bestTime = realLevelTime;
      //Добавялем IQ за выполнение задач
      const taskObject = userData.taskObject;
      let iq = userData.statistics.iq;
      if(taskObject){
        if(taskObject.tasks['levels'] && !taskObject.tasks['levels'].taskCompleted){
          taskObject.tasks['levels'].now = taskObject.tasks['levels'].now + 1;
          if(taskObject.tasks['levels'].now >= taskObject.tasks['levels'].goal){
            iq = iq + 1;
            taskObject.tasks['levels'].taskCompleted = true;
          }
        }
        if(levelWithoutMistake && taskObject.tasks['levelWithoutMistake']
          && !taskObject.tasks['levelWithoutMistake'].taskCompleted
        ){
          taskObject.tasks['levelWithoutMistake'].now = taskObject.tasks['levelWithoutMistake'].now + 1;
          if(taskObject.tasks['levelWithoutMistake'].now >= taskObject.tasks['levelWithoutMistake'].goal){
            iq = iq + 1;
            taskObject.tasks['levelWithoutMistake'].taskCompleted = true;
          }
        }
        if(taskObject.tasks['time'] &&
           !taskObject.tasks['time'].taskCompleted
        ){
          taskObject.tasks['time'].now = getMinutesFromSeconds(getGameSeconds());
          if(taskObject.tasks['time'].now >= taskObject.tasks['time'].goal){
            iq = iq + 1;
            taskObject.tasks['time'].taskCompleted = true;
          }
        }
      }
      setUserData({
        ...userData,
        lastLevel: level + 1,
        lastLevelData: null,
        statistics: {
          ...userData.statistics,
          iq: iq,
          levels: passedLevels,
          letters: userData.statistics.letters + newLetters,
          words: userData.statistics.words + newWords,
          perfectLevels: levelWithoutMistake ? userData.statistics.perfectLevels + 1 : userData.statistics.perfectLevels,
          avgTime: avgTime,
          bestTime: bestTime
        },
        taskObject: taskObject
      })
    }else{
      //Если обновляем кол-во ошибок, то записываем в статистику
      let addErrors = false;
      if(newLevelData.errors && newLevelData.errors > 0) {
        addErrors = true;
      }
      setUserData({...userData,
        lastLevelData: {
         ...userData.lastLevelData,
         ...newLevelData,
         time: getLevelTime()
       },
       statistics: {
        ...userData.statistics,
        errors: addErrors ? userData.statistics.errors + 1 : userData.statistics.errors,
       }
     })
    }
  }

  const saveDataAndGoMenu = () => {
    updateLastLevelData({}, false)
    onMenu()
  }
  const blockedTimeRef = useRef(blockedTime);
  useEffect(() => {
    blockedTimeRef.current = blockedTime;
  }, [blockedTime]);
  const endBlockTime = () => {
    if(blockedTimeRef.current === 0) return;
    console.log('endBlockTime 2', blockedTimeRef.current, errors);
    setBlockedTime(0)
    setTimeout(() => {
      setBlockedTimeTimer(0)
    }, 1000)
    setErrors(0)
    updateLastLevelData({errors: 0, isKeyboardBlocked: false})
    setTimeout(() => {
      console.log('endBlockTime 3', blockedTimeRef.current);
    }, 1000)
  };
  const cancelBlockedByMoney = () => {
    if(userData.money >= cancelBlockPrice){
      setUserData({...userData, money: userData.money - cancelBlockPrice})
      endBlockTime();
    }
  }
  const switchOnBlockedKeyboard = () => {
    showAdv();
    let blockedTime = 5000;
    setBlockedTime(blockedTime)
    setBlockedTimeTimer(blockedTime / 1000);
  }
  const addErrors = () => {
    if(errors >= 2){
      switchOnBlockedKeyboard();
      updateLastLevelData({errors: errors+1, isKeyboardBlocked: true})
    }else{
      updateLastLevelData({errors: errors+1, isKeyboardBlocked: false, atLeastOneError: true})
      if(phraseData) setPhraseData({...phraseData, atLeastOneError: true})
    }
    setErrorScreenAnimation(true);
    setTimeout(() => {
      setErrorScreenAnimation(false);
    }, 800)
    setErrors(prev => prev + 1)
    
  }
  const switchTipSelecting = () => {
    if(!isTipSelecting && userData.tips > 0){
      setIsTipSelecting(true);
    }else{
      setIsTipSelecting(false);
    }
  }
  const useTip = () => {
    if(userData.tips > 0){
      setUserData({...userData, tips: userData.tips - 1})
      setIsTipSelecting(false);
    }
  }
  const handleCompleteNumber = (letter: string) => {
    setInactiveKeys(prev => new Set([...prev, letter.toLowerCase()]))
  }

  useEffect(() => {
    if(phraseData && Object.keys(phraseData.filledLetters).length === phraseData.hiddenIndexes.length){
      setTimeout(()=>{
        try{
          let scrollEl = document.querySelector('.phrase-row');
          if(scrollEl) scrollEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }catch(ignored){}
        setTimeout(()=>{
          setIsLevelCompleted(true)
        }, 500)
      }, 3300);
      realLevelTime = getLevelTime();
      updateLastLevelData({}, true)
    }else if(phraseData){
      updateLastLevelData(phraseData)
    }
  }, [phraseData])

  const getNextLevel = () => {
    setLevel(level + 1)
    setLevelData(levels[level + 1]);
    reset();
    setNotShowKeyboard(false)
  }

  const generateNumbersForLetters = (text: string) => {
    // Преобразуем текст в верхний регистр
    text = text.toUpperCase()
    
    const letterMap = new Map<string, number>()
    const numbers: number[] = []
    const smallNumber = [1,2,3,4,5,6,7,8,9];
    function getRandomSmallNumber(){
      if(smallNumber.length === 0) return -1;
      const rand = Math.floor(Math.random() * smallNumber.length);
      const num = smallNumber[rand];
      smallNumber.splice(rand, 1);
      return num;
    }

    text.split('').forEach((char) => {
      // Пропускаем знаки препинания и пробелы
      if (/[^А-Я]/.test(char)) {
        numbers.push(0) // 0 для не-букв
        return
      }

      if (!letterMap.has(char)) {
        // Генерируем случайное число от 1 до 99 для новой буквы
        let randomNum = -1;
        if(level < 3){
          randomNum = getRandomSmallNumber();
        }
        if(randomNum === -1){
          do {
            randomNum = Math.floor(Math.random() * 99) + 1
          } while (Array.from(letterMap.values()).includes(randomNum)) // Убеждаемся, что число уникально
        }
        letterMap.set(char, randomNum)
      }

      numbers.push(letterMap.get(char)!)
    })

    return numbers
  }

  const updateCompletedNumbers = (
    filledLetters: Record<number, string>,
    data: { text: string; numbers: number[]; hiddenIndexes: number[] }
  ) => {
    const completedNumbers = new Set<number>()
    const numberPositions = new Map<number, number[]>()

    // Собираем все позиции для каждого числа
    data.text.split('').forEach((letter, index) => {
      const number = data.numbers[index]
      if (number === 0) return

      if (!numberPositions.has(number)) {
        numberPositions.set(number, [])
      }
      numberPositions.get(number)!.push(index)
    })

    // Проверяем каждое число
    numberPositions.forEach((positions, number) => {
      // Получаем букву из первой позиции (либо заполненную, либо исходную)
      const firstPos = positions[0]
      const firstLetter = filledLetters[firstPos] || 
        (!data.hiddenIndexes.includes(firstPos) ? data.text[firstPos] : null)

      if (firstLetter) {
        // Проверяем, совпадают ли все буквы с первой
        const allMatch = positions.every(pos => {
          const letter = filledLetters[pos] || 
            (!data.hiddenIndexes.includes(pos) ? data.text[pos] : null)
          return letter && letter.toUpperCase() === firstLetter.toUpperCase()
        })

        if (allMatch) {
          completedNumbers.add(number)
        }
      }
    })

    return completedNumbers
  }

  const switchOnGlowScreen = () => {
    // setGlowScreenAnimation(true)
    setTimeout(() => {
      // setGlowScreenAnimation(false)
    }, 1500)
  }

  const handleLetterFill = (filledLetters: Record<number, string>) => {
    if (!phraseData) return
    
    const completedNumbers = updateCompletedNumbers(filledLetters, {
      text: phraseData.text,
      numbers: phraseData.numbers,
      hiddenIndexes: phraseData.hiddenIndexes
    })
    setPhraseData(prev => prev ? { ...prev, filledLetters, completedNumbers } : prev)
  }
  const generateLevel = () => {
    console.log("generateLevel");
    showAdv()
    setIsLevelCompleted(false)
    setErrors(0)
    setIsTipSelecting(false)
    setNotShowKeyboard(false)
    setBlockedTime(0)
    setBlockedTimeTimer(0)
    setLevelTime(0)
    // Генерируем числа при первой загрузке уровня
    const text = levelData.text.toUpperCase()
    const numbers = generateNumbersForLetters(text)
    let initialPhraseData = {
      text,
      numbers,
      hiddenIndexes: levelData.hiddenIndexes,
      filledLetters: {} as Record<number, string>,
      completedNumbers: new Set<number>(),
      errors: 0,
      isKeyboardBlocked: false,
      time: 0,
      atLeastOneError: false
    }

    // Проверяем начальные completedNumbers
    const initialCompletedNumbers = updateCompletedNumbers(
      initialPhraseData.filledLetters,
      {
        text: initialPhraseData.text,
        numbers: initialPhraseData.numbers,
        hiddenIndexes: initialPhraseData.hiddenIndexes
      }
    )
    initialPhraseData.completedNumbers = initialCompletedNumbers

    //Если игрок проходил этот уровень ранее, то загружаем данные из последнего уровня
    if(userData.lastLevelData && userData.lastLevelData.text === initialPhraseData.text){
      initialPhraseData = userData.lastLevelData;
      if(initialPhraseData.isKeyboardBlocked){
        switchOnBlockedKeyboard();
      }
      setErrors(initialPhraseData.errors);
      setLevelTime(initialPhraseData.time);
    }else{
      //Вызываем подсказку, сколько игроков прошли этот уровень без ошибок
      setShowPlayersPassedLevel(true);
      setTimeout(() => {
        setShowPlayersPassedLevel(false);
      }, 5000);
    }

    // Проверяем неактивные буквы
    const newInactiveKeys = new Set<string>()
    const letterPositions = new Map<number, { letter: string, positions: number[] }>()

    // Собираем все позиции для каждого числа
    text.split('').forEach((letter, index) => {
      const number = numbers[index]
      if (number === 0) return

      if (!letterPositions.has(number)) {
        letterPositions.set(number, { letter, positions: [] })
      }
      letterPositions.get(number)!.positions.push(index)
    })

    // Проверяем каждое число
    letterPositions.forEach(({ letter, positions }, number) => {
      // Проверяем, все ли позиции этого числа видимы (не скрыты)
      const allVisible = positions.every(pos => !levelData.hiddenIndexes.includes(pos))
      if (allVisible) {
        newInactiveKeys.add(letter.toLowerCase())
      }
    })

    setInactiveKeys(newInactiveKeys)
    setPhraseData(initialPhraseData)
    phraseRef.current?.updatePhrase(initialPhraseData);
  }
  //Вызываем перегенерацию уровня при первой загрузке и при смене уровня

  useEffect(() => {
    generateLevel()
  }, [level])

    const guessedPercent = phraseData
    ? Math.round(
        (Object.keys(phraseData.filledLetters).length / phraseData.hiddenIndexes.length) * 100
      )
    : 0

  if (!phraseData) return null

  return (
    <div className={`game-bg ${isLevelCompleted ? 'game-bg_levelCompleted' : ''}`}>
      {isTipSelecting  && <div className="game-bg-blackout"></div>}
      {showPlayersPassedLevel && <div className="game-bg-blackout game-bg-blackout_playersPassed" onClick={() => setShowPlayersPassedLevel(false)}></div>}
      {isLevelCompleted && <div className="game-bg-blur"></div>}
      {/* Header */}
      {(glowScreenAnimation || errorScreenAnimation) &&
       <div className={`glow-screen ${errorScreenAnimation ? 'glow-screen_error' : ''}`}>
        <div className="edge-line-left"></div>
        <div className="edge-line-right"></div>
      </div>
      }
      

      <div className={`game-header`}>
      <SwitchTransition mode="out-in">
      <CSSTransition
        key={isLevelCompleted ? 'game-header_big' : 'game-header_small'}
        timeout={1000}
        classNames="fade"
      >
        <div>
        {isLevelCompleted ?
                <div className="game-header-wrap">
                  <div className="menu-home-btn" onClick={onMenu}></div>
                  <div className="game-header-gameName">
                    <div className="quote-icon"></div>
                    <span className='game-header-gameName_text'>Цитаты</span>
                 </div>
                 <div className='game-header-time'>
                  <div className="game-header-time-icon"></div>
                  <span className='game-header-time_text'>{formatTime(realLevelTime)}</span>
                 </div>
                </div>
                 :
                <div className="game-header-wrap">
                <div className="menu-settings-btn" onClick={() => setIsShowSettings(true)} style={{opacity: isTipSelecting ? 0 : 1}}></div>
                <div className='game-header_sameSize' style={{opacity: isTipSelecting ? 0 : 1}} onClick={getSeconds}> {guessedPercent}%</div>
                <div className="text-center" style={{opacity: isTipSelecting ? 0 : 1}}>
                    <div>Ошибки</div>
                    <div className="flex mt-1 justify-center">
                      {[...Array(3)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`mistakeCircle ${i < errors ? 'mistakeCircle_got' : ''}`} 
                        >
                        </div>
                      ))}
                    </div>
                 </div>
                 <div className='game-header_sameSize' style={{opacity: isTipSelecting ? 0 : 1}}>Ур. {level+1}</div>
                 <div className={`menu-tips-btn ${isTipSelecting ? 'menu-tips-btn_close' : ''}`} onClick={switchTipSelecting}>
                    <div className="menu-tips-btn__count" style={{opacity: isTipSelecting ? 0 : 1}}>{userData.tips}</div>
                 </div>
              </div>}
        </div>
        
      </CSSTransition>
    </SwitchTransition>
        

      </div>



      {/* Main content (Phrase + Hint) */}
      <div className="game-main">
        <Phrase 
          ref={phraseRef}
          data={phraseData}
          onError={addErrors}
          onLetterFill={handleLetterFill}
          onCompleteNumber={handleCompleteNumber}
          blockedTime={blockedTime}
          isTipSelecting={isTipSelecting}
          useTip={useTip}
          isLevelCompleted={isLevelCompleted}
          level={level}
          switchOnGlowScreen={switchOnGlowScreen}
        />
        {isLevelCompleted && (
          <div className="game-main_author">
            <div className="game-main_author-name">{levelData.name}</div>
            <div className="game-main_author-desc">{levelData.desc}</div>
          </div>
        )}
        {isLevelCompleted && (
          <div className="nextLevelButton" onClick={getNextLevel}>
            <div className="nextLevelButton-text">ДАЛЕЕ</div>
            <div className="nextLevelButton-level">Уровень {level + 2}</div>
          </div>
        )}
      </div>

      {/* Keyboard */}
      {!notShowKeyboard && (
        <div
       className={`game-keyboard ${isLevelCompleted ? 'game-keyboard_hidden' : ''}`}
       onAnimationEnd={(e)=>{
        if(e.animationName === 'keyboardAnimation'){
          setNotShowKeyboard(true)
        }
      }}
      >
        <Keyboard 
          onKeyPress={(key) => phraseRef.current?.handleKeyPress(key)} 
          inactiveKeys={inactiveKeys}
          phraseData={phraseData}
        />
        <div className={`game-keyboard-buttons ${userData.settings.arrowLeft ? 'game-keyboard-buttons_left' : ''}`}>
          <div className="game-keyboard-moveLeft" onClick={() => {phraseRef.current?.getNextEmptyIndex(true)}}></div>
          <div className="game-keyboard-moveRight" onClick={() => {phraseRef.current?.getNextEmptyIndex(false)}}></div>
        </div>
        <div className={`keyboard-blocked ${blockedTime > 0 ? 'keyboard-blocked_show' : ''}`}>
            <ProgressCircle
                  blockedTime={blockedTime}
                  size={65}
                  strokeWidth={1}
                  endBlockTime={endBlockTime}
                  blockedTimeTimer={blockedTimeTimer}
                  setBlockedTimeTimer={setBlockedTimeTimer}
              />
            

            <div className="keyboard-blocked-text">
              Вы сделали 3 ошибки, поэтому клавиатура <br></br> заблокирована на <span className="keyboard-blocked-text__time">{blockedTimeTimer} секунд
              </span>
            </div>
            <div className="cancelBlocked" onClick={cancelBlockedByMoney}>
              <div className="moneyCount">
                    <div className="modal-shop-row-price-icon">
                    </div>{cancelBlockPrice}
               </div>
              <div className="cancelBlocked-text">ОТМЕНИТЬ</div>
            </div>
        </div>
        {isTipSelecting && (
          <Tip character="nerd">
            Выберите ячейку<br></br> для открытия
          </Tip>
        )}
        <Tip
         character="dance"
          tipClassName="tip-upper"
           notShow={!showPlayersPassedLevel || isTipSelecting}
           onClick={() => setShowPlayersPassedLevel(false)}
          >
          Только 95% игроков прошли этот уровень<br></br> без ошибок!
        </Tip>
      </div>
      )}
      
      {isShowSettings && (
          <Settings
            userData={userData}
            onClose={() => setIsShowSettings(false)}
            setUserData={setUserData}
            onHome={saveDataAndGoMenu}
          />
        )}
    </div>
  )
}

export default Game 