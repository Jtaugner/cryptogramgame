import { useState, useEffect, useRef, useCallback } from 'react'
import Keyboard from './Keyboard'
import Phrase from './Phrase'
import './Game.css'
import ProgressCircle from '../ProgressCircle'
import { countWordsWithHiddenLetters, getCollectionName, getHint, levels, percentOfLevels } from '../levels'
import { usePageActiveTimer } from './PageTimer'
import { UserDataProps, LevelDataProps } from '../App'
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import Settings from './modalComponents/Settings'
import Tip from './modalComponents/Tip'
import { LevelData, formatTime} from '../levels'
import { showAdv, params } from '../main'
import { getMinutesFromSeconds } from '../tasks'
import Confetti from 'confetti-react';

interface GameProps {
  onMenu: () => void
  userData: UserDataProps
  setUserData: (userData: UserDataProps) => void
  getGameSeconds: () => number
  copyFunction: (levelData: LevelData) => void
  testTasks: (taskObject: any, iq: number) => any
  playSound: (soundName: string) => void
  setShowShop: (showShop: boolean) => void
  setShowShopMoney: (showShopMoney: boolean) => void
}

const cancelBlockPrice = 1;
const moneyToAdd = 3;
let realLevelTime = 0;

let timeToAdd = 0;
let reduceMoney = false;

const Game: React.FC<GameProps> = ({ onMenu, userData, setUserData,
   getGameSeconds, copyFunction, testTasks, playSound, setShowShop, setShowShopMoney }) => { 
  const [level, setLevel] = useState(userData.lastLevel)
  const [isLevelCompleted, setIsLevelCompleted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [diceMode, setDiceMode] = useState(false)
  const [isShowSettings, setIsShowSettings] = useState(false)
  const [isTipSelecting, setIsTipSelecting] = useState(false)
  const [showPlayersPassedLevel, setShowPlayersPassedLevel] = useState(false)
  const [errors, setErrors] = useState(0)
  const [blockedTime, setBlockedTime] = useState(0)
  const [notShowKeyboard, setNotShowKeyboard] = useState(false)
  const [openedFromGame, setOpenedFromGame] = useState(false)
  const [blockedTimeTimer, setBlockedTimeTimer] = useState(0)
  const [selecetedHint, setSelecetedHint] = useState(0)
  const [glowScreenAnimation, setGlowScreenAnimation] = useState(false)
  const [errorScreenAnimation, setErrorScreenAnimation] = useState(false)
  const [phraseData, setPhraseData] = useState<LevelDataProps>()
  const [inactiveKeys, setInactiveKeys] = useState<Set<string>>(new Set())
  const [levelData, setLevelData] = useState<LevelData>(levels[level]);

  const phraseRef = useRef<{ handleKeyPress: (key: string) => void, updatePhrase: (data: LevelDataProps) => void, getNextEmptyIndex: (getPrevious: boolean) => void }>(null)
  const timeoutIds = useRef<number[]>([]);
  const levelGenerated = useRef(-1)

  //Время
  const { getSeconds, reset } = usePageActiveTimer()


  const getLevelTime = () => {
    let time = timeToAdd + getSeconds(false);
    console.log('getLevelTime', time);
    return time;
  }



  const updateLastLevelData = (
     newLevelData: object,
     levelCompleted: boolean = false,
     addErrors: boolean = false
    ) => {
    if(levelCompleted){
      params({'levelPassed': level});
      if(level === 10){
        params({'levels10Tips': userData.tips});
        params({'levels10Money': userData.money});
      }else if(level === 20){
        params({'levels20Tips': userData.tips});
        params({'levels20Money': userData.money});
      }else if(level === 50){
        params({'levels50Tips': userData.tips});
        params({'levels50Money': userData.money});
      }else if(level === 100){
        params({'levels100Tips': userData.tips});
        params({'levels100Money': userData.money});
      }
      //Для статистики
      const newLetters = levelData ? levelData.hiddenIndexes.length : 0;
      const newWords = levelData ? countWordsWithHiddenLetters(levelData) : 0;
      const levelWithoutMistake = userData.lastLevelData ? !userData.lastLevelData.atLeastOneError : false;
      const passedLevels = userData.statistics.levels + 1;
      const avgTime = (userData.statistics.avgTime * userData.statistics.levels + realLevelTime) / (passedLevels);
      let bestTime = Math.min(userData.statistics.bestTime, realLevelTime);
      if(bestTime === 0) bestTime = realLevelTime;
      //Добавялем IQ за выполнение задач
      let taskObject = userData.taskObject;
      let iq = userData.statistics.iq;
      if(taskObject){
        let newTaskObject = testTasks(taskObject, iq);
        if(newTaskObject) taskObject = newTaskObject;
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
          taskObject.tasks['time'].now = taskObject.tasks['time'].now + getMinutesFromSeconds(getGameSeconds());
          if(taskObject.tasks['time'].now >= taskObject.tasks['time'].goal){
            iq = iq + 1;
            taskObject.tasks['time'].taskCompleted = true;
          }
        }
        taskObject = testTasks(taskObject, iq);
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
        taskObject: taskObject,
        money: userData.money + moneyToAdd
      })
    }else{
      console.log('update lastLevelData', newLevelData.time);
      let money = userData.money;
      //Вычитаем деньги за разблокировку клавиатуры
      if(reduceMoney){
        money = money - cancelBlockPrice;
        reduceMoney = false;
      }
      //Если обновляем кол-во ошибок, то записываем в статистику
      setUserData({...userData,
        lastLevelData: {
         ...userData.lastLevelData,
         ...newLevelData,
         time: getLevelTime()
       },
       statistics: {
        ...userData.statistics,
        errors: addErrors ? userData.statistics.errors + 1 : userData.statistics.errors,
       },
       money: money
     })
    }
  }

  const saveDataAndGoMenu = () => {
    updateLastLevelData({}, false, false)
    onMenu()
  }
  const switchOffHint = () => {
    setSelecetedHint(0)
  }
  const blockedTimeRef = useRef(blockedTime);

  useEffect(() => {
    blockedTimeRef.current = blockedTime;
  }, [blockedTime]);

  const endBlockTime = () => {
    if(blockedTimeRef.current === 0) return;
    setBlockedTime(0)
    timeoutIds.current.push(setTimeout(() => {
      setBlockedTimeTimer(0)
    }, 1000))
    setErrors(0)
    updateLastLevelData({errors: 0, isKeyboardBlocked: false}, false, false)
  };
  const cancelBlockedByMoney = () => {
    if(userData.money >= cancelBlockPrice){
      reduceMoney = true;
      endBlockTime();
    }else{
      setShowShopMoney(true);
    }
  }
  const showAdvWrapper = () => {
    if(__PLATFORM__ === 'gp' && level > 2){
      showAdv();
    }else if(__PLATFORM__ === 'yandex'){
      showAdv();
    }
  }

  const switchOnBlockedKeyboard = () => {
    showAdvWrapper();
    let blockedTime = 30000;
    if(userData?.lastLevelData?.keyboardBlockedTimes){
      blockedTime += userData.lastLevelData.keyboardBlockedTimes * 10000;
    }
    setBlockedTimeTimer(blockedTime / 1000);
    setBlockedTime(blockedTime)
    
  }
  const addErrors = () => {
    if(errors >= 2){
      switchOnBlockedKeyboard();
      playSound('keyboardBlocked');
      let keyboardBlockedTimes = 1;
      if(userData?.lastLevelData?.keyboardBlockedTimes){
        keyboardBlockedTimes += userData.lastLevelData.keyboardBlockedTimes;
      }
      updateLastLevelData({
         errors: errors+1,
         isKeyboardBlocked: true,
         keyboardBlockedTimes: keyboardBlockedTimes
        }, false, true)
    }else{
      console.log('update form there');
      updateLastLevelData({
        errors: errors+1,
        isKeyboardBlocked: false,
        atLeastOneError: true
      }, false, true)
    }
    setErrorScreenAnimation(true);
    timeoutIds.current.push(setTimeout(() => {
      setErrorScreenAnimation(false);
    }, 800))
    setErrors(prev => prev + 1)
    
  }
  const switchTipSelecting = () => {
    if(!isTipSelecting){
      if(userData.tips > 0){
        setIsTipSelecting(true);
      }else{
        setShowShop(true);
      }
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
      timeoutIds.current.push(setTimeout(()=>{
        try{
          if(__PLATFORM__ === 'yandex'){
            let scrollEl = document.querySelector('.phrase-row');
            if(scrollEl) scrollEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }catch(ignored){}
        timeoutIds.current.push(setTimeout(()=>{
          setIsLevelCompleted(true)
          playSound('win');
        }, 500))
      }, 1500));
      realLevelTime = getLevelTime();
      updateLastLevelData({}, true, false)
    }else if(phraseData){
      updateLastLevelData({
        completedNumbers: phraseData.completedNumbers,
        filledLetters: phraseData.filledLetters
      }, false, false)
    }
  }, [phraseData])

  const getNextLevel = () => {
    if(__PLATFORM__ === 'gp'){
      showAdvWrapper()
    }
    if(level === levels.length - 1){
      onMenu();
      return;
    }
    playSound('changeWindow');
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
        // Генерируем случайное число от 1 до 36 для новой буквы
        let randomNum = -1;
        if(level < 3){
          randomNum = getRandomSmallNumber();
        }
        if(randomNum === -1){
          do {
            randomNum = Math.floor(Math.random() * 36) + 1
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
    if(levelGenerated.current === level) return;
    console.log("\x1b[34mgenerateLevel\x1b[0m");
    if(__PLATFORM__ === 'yandex'){
      showAdvWrapper()
    }
    setIsLevelCompleted(false)
    setErrors(0)
    setIsTipSelecting(false)
    setNotShowKeyboard(false)
    setBlockedTime(0)
    setBlockedTimeTimer(0)
    if((level+1) % 10 === 0){
      setDiceMode(true);
    }else{
      setDiceMode(false);
    }
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
      atLeastOneError: false,
      keyboardBlockedTimes: 0
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
      console.log('user has lastLevel data'); 
      initialPhraseData = userData.lastLevelData;
      if(initialPhraseData.isKeyboardBlocked){
        switchOnBlockedKeyboard();
      }
      setErrors(initialPhraseData.errors);
    }else{
      //Вызываем подсказку, сколько игроков прошли этот уровень без ошибок
      if(percentOfLevels[level as keyof typeof percentOfLevels] !== undefined){
        setShowPlayersPassedLevel(true);
        timeoutIds.current.push(setTimeout(() => {
          setShowPlayersPassedLevel(false);
        }, 5000));
      }
    }
    initialPhraseData.hiddenIndexes = levelData.hiddenIndexes;

    //На первом уровне и на 10-ом уровне показываем правила
    if((level === 0 || level === 9) &&
     Object.keys(initialPhraseData.filledLetters).length === 0){
      setIsShowSettings(true);
      setOpenedFromGame(true);
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
      const allVisible = positions.every(pos =>
         (!levelData.hiddenIndexes.includes(pos)
          || initialPhraseData.filledLetters[pos] !== undefined))
      if (allVisible) {
        newInactiveKeys.add(letter.toLowerCase())
      }
    })


    timeToAdd = initialPhraseData.time;
    setInactiveKeys(newInactiveKeys)
    setPhraseData(initialPhraseData)
    updateLastLevelData({...initialPhraseData}, false, false);
    phraseRef.current?.updatePhrase({...initialPhraseData});
    levelGenerated.current = level;
  }
  //Вызываем перегенерацию уровня при первой загрузке и при смене уровня

  useEffect(() => {
    generateLevel()
  }, [level])

  useEffect(() => {
    //Unmount
    return () => {
      timeoutIds.current.forEach(clearTimeout);
    };
  }, [])


  if (!phraseData) return null

  return (
    <div className={`game-bg ${isLevelCompleted ? 'game-bg_levelCompleted' : ''}`}>
      {isTipSelecting  && <div className="game-bg-blackout"></div>}
      {selecetedHint !== 0 && <div className="game-bg-blackout blackout-hint" onClick={switchOffHint}></div>}
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
                    <div className={`game-header-type-icon-levelDone
                      game-header-type-icon-levelDone_${levelData.type}`}></div>
                    <span className='game-header-gameName_text'>{getCollectionName(levelData.type)}</span>
                 </div>
                 <div className='game-header-time'>
                  <div className="game-header-time-icon"></div>
                  <span className='game-header-time_text'>{formatTime(realLevelTime)}</span>
                 </div>
                </div>
                 :
                <div className="game-header-wrap">
                  <div
                   className={`menu-settings-btn ${isTipSelecting || (selecetedHint !== 0) ? 'disabledButton' : ''}`}
                   onClick={() => setIsShowSettings(true)}>
                  </div>
                  <div className={`game-header_sameSize ${isTipSelecting || (selecetedHint !== 0 && selecetedHint !== 1) ? 'disabledButton' : ''}`}>
                    <div className={`game-header-type-icon
                      game-header-type-icon_${levelData.type}`}
                      onClick={() => {
                        if(selecetedHint === 1){
                          setSelecetedHint(0)
                        }else{
                          setSelecetedHint(1)
                        }
                      }}
                      >
                      </div>
                  </div>
                  <div className={`text-center ${isTipSelecting || (selecetedHint !== 0 && selecetedHint !== 2) ? 'disabledButton' : ''}`}
                    onClick={() => {
                      if(selecetedHint === 2){
                        setSelecetedHint(0)
                      }else{
                        setSelecetedHint(2)
                      }
                    }}
                  >
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
                  <div className={`game-header_sameSize
                     ${isTipSelecting || (selecetedHint !== 0) ? 'disabledButton' : ''}`}>
                    Ур. {level+1}
                    </div>
                  <div className={`
                        menu-tips-btn
                        ${isTipSelecting ? 'menu-tips-btn_close' : ''}
                        ${selecetedHint !== 0 ? 'disabledButton' : ''}`
                      }
                      onClick={switchTipSelecting}>
                      <div className="menu-tips-btn__count"
                       style={{opacity: isTipSelecting ? 0 : 1}}>
                        {userData.tips}
                        </div>
                  </div>
              </div>
            }
        </div>
        
      </CSSTransition>
    </SwitchTransition>
        
      {/* Hint */}
      {
        selecetedHint !== 0 &&
        <div className="game-hint" onClick={switchOffHint}>
          <div className="game-hint-title">{selecetedHint === 1 ? getCollectionName(levelData.type) : getHint(selecetedHint).title}</div>
          <div className="game-hint-text">{getHint(selecetedHint).text}</div>
        </div>
      }


      </div>



      {isLevelCompleted && showConfetti &&
      <div className="phrase-boom">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            gravity={0.2}
            onConfettiComplete={() => setShowConfetti(false)}
            />
      </div>
      }
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
          levelData={levelData}
          copyFunction={copyFunction}
          setShowConfetti={setShowConfetti}
          diceMode={diceMode}
          playSound={playSound}
          inactiveKeys={inactiveKeys}
        />
        {isLevelCompleted && (
          <>
            <div className="addedMoney">
              <div className="modal-shop-row-price-icon"></div>
              +{moneyToAdd}
            </div>
            <div
             className="nextLevelButton"
             onAnimationEnd={(e)=>{
              if(e.animationName === 'mainOpacityAnimation'){
                playSound('addMoney');
              }
             }}
             onClick={getNextLevel}
             
             >
              <div className="nextLevelButton-text">ДАЛЕЕ</div>
              <div className="nextLevelButton-level">Уровень {level + 2}</div>
            </div>
          </>
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
        {
          !isTipSelecting &&
          <div className={`game-keyboard-buttons ${userData.settings.arrowLeft ? 'game-keyboard-buttons_left' : ''}`}>
            <div className="game-keyboard-moveLeft" onClick={() => {
              phraseRef.current?.getNextEmptyIndex(true)
              playSound('changeLetter');
              }}></div>
            <div className="game-keyboard-moveRight" onClick={() => {
              phraseRef.current?.getNextEmptyIndex(false);
              playSound('changeLetter');
              }}></div>
          </div>
        }

        <div className={`keyboard-blocked ${blockedTime > 0 ? 'keyboard-blocked_show' : ''}`}>
            {blockedTime > 0 && (
            <ProgressCircle
                  blockedTime={blockedTime}
                  size={65}
                  strokeWidth={1}
                  endBlockTime={endBlockTime}
                  blockedTimeTimer={blockedTimeTimer}
                  setBlockedTimeTimer={setBlockedTimeTimer}
              />
            )}

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
          Только {percentOfLevels[level as keyof typeof percentOfLevels]} игроков прошли этот уровень<br></br> без ошибок!
        </Tip>
      </div>
      )}
      
      {isShowSettings && (
          <Settings
            userData={userData}
            onClose={() => {
              setIsShowSettings(false);
              setOpenedFromGame(false);
            }}
            setUserData={setUserData}
            onHome={saveDataAndGoMenu}
            diceMode={diceMode}
            openedFromGame={openedFromGame}
          />
        )}
    </div>
  )
}

export default Game 