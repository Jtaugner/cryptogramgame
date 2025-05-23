import { useState, useEffect, useRef } from 'react'
import Keyboard from './Keyboard'
import Phrase from './Phrase'
import './Game.css'
import ProgressCircle from '../ProgressCircle'
import { levels } from '../levels'
import { usePageActiveTimer } from './PageTimer'
import { UserDataProps } from '../App'
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import Settings from './modalComponents/Settings'
import Lottie from 'react-lottie-player'
import animationData from '../Hi/Nerd.json'
import Tip from './modalComponents/Tip'

interface LevelData {
  text: string
  hiddenIndexes: number[]
  name: string
  desc: string
}
interface GameProps {
  onMenu: () => void
  userData: UserDataProps
  setUserData: (userData: UserDataProps) => void
}
function formatTime(seconds: number) {
  let mins = Math.floor(seconds / 60).toString();
  if(mins.length === 1){
    mins = '0' + mins;
  }
  let secs = (seconds % 60).toString();
  if(secs.length === 1){
    secs = '0' + secs;
  }
  return `${mins}:${secs}`;
}

const Game: React.FC<GameProps> = ({ onMenu, userData, setUserData }) => { 
  const [level, setLevel] = useState(userData.lastLevel)
  const [isLevelCompleted, setIsLevelCompleted] = useState(false)
  const [isShowSettings, setIsShowSettings] = useState(false)
  const [isTipSelecting, setIsTipSelecting] = useState(false)
  const [showPlayersPassedLevel, setShowPlayersPassedLevel] = useState(false)
  const [errors, setErrors] = useState(0)
  const [blockedTime, setBlockedTime] = useState(0)
  const [blockedTimeTimer, setBlockedTimeTimer] = useState(0)
  const [phraseData, setPhraseData] = useState<{ 
    text: string
    numbers: number[]
    hiddenIndexes: number[]
    filledLetters: Record<number, string>
    completedNumbers: Set<number>
  }>()
  const [inactiveKeys, setInactiveKeys] = useState<Set<string>>(new Set())
  const [levelData, setLevelData] = useState<LevelData>(levels[level]);
  const phraseRef = useRef<{ handleKeyPress: (key: string) => void, updatePhrase: (data: {
    text: string
    numbers: number[]
    hiddenIndexes: number[]
    filledLetters: Record<number, string>
    completedNumbers: Set<number>
  }) => void }>(null)

  //Время
  const { getSeconds, reset } = usePageActiveTimer()
  
  const endBlockTime = () => {
    setBlockedTime(0)
    setBlockedTimeTimer(0)
    setErrors(0)
  }
  const addErrors = () => {
    setErrors(prev => prev + 1)
    if(errors >= 2){
      console.log('blockedTime')
      let blockedTime = 10000;
      setBlockedTime(blockedTime)
      setBlockedTimeTimer(blockedTime / 1000);
    }
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
      setUserData({...userData, lastLevel: level + 1});
      setTimeout(()=>{
        try{
          let scrollEl = document.querySelector('.phrase-row');
          if(scrollEl) scrollEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }catch(ignored){}
        setTimeout(()=>{
          setIsLevelCompleted(true)
        }, 500)
      }, 3300);
    }
  }, [phraseData])

  const getNextLevel = () => {
    setLevel(level + 1)
    setLevelData(levels[level + 1]);
    reset();
  }

  const generateNumbersForLetters = (text: string) => {
    // Преобразуем текст в верхний регистр
    text = text.toUpperCase()
    
    const letterMap = new Map<string, number>()
    const numbers: number[] = []

    text.split('').forEach((char) => {
      // Пропускаем знаки препинания и пробелы
      if (/[^А-Я]/.test(char)) {
        numbers.push(0) // 0 для не-букв
        return
      }

      if (!letterMap.has(char)) {
        // Генерируем случайное число от 1 до 99 для новой буквы
        let randomNum
        do {
          randomNum = Math.floor(Math.random() * 99) + 1
        } while (Array.from(letterMap.values()).includes(randomNum)) // Убеждаемся, что число уникально
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
    setIsLevelCompleted(false)
    setErrors(0)
    setIsTipSelecting(false)
    setBlockedTime(0)
    setBlockedTimeTimer(0)
    // Генерируем числа при первой загрузке уровня
    const text = levelData.text.toUpperCase()
    const numbers = generateNumbersForLetters(text)
    const initialPhraseData = {
      text,
      numbers,
      hiddenIndexes: levelData.hiddenIndexes,
      filledLetters: {} as Record<number, string>,
      completedNumbers: new Set<number>()
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
    console.log(phraseRef);
    console.log(phraseRef.current);
    phraseRef.current?.updatePhrase(initialPhraseData);
  }
  //Вызываем перегенерацию уровня при первой загрузке и при смене уровня

  useEffect(() => {
    generateLevel()
    setShowPlayersPassedLevel(true);
    setTimeout(() => {
      setShowPlayersPassedLevel(false);
    }, 5000);
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
                  <span className='game-header-time_text'>{formatTime(getSeconds())}</span>
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
      <div className={`game-keyboard ${isLevelCompleted ? 'game-keyboard_hidden' : ''}`}>
        <Keyboard 
          onKeyPress={(key) => phraseRef.current?.handleKeyPress(key)} 
          inactiveKeys={inactiveKeys}
        />
        {blockedTime > 0 && (
          <div className="keyboard-blocked">
            <ProgressCircle
             duration={blockedTime}
             size={70}
             strokeWidth={1}
             endBlockTime={endBlockTime}
             blockedTimeTimer={blockedTimeTimer}
             setBlockedTimeTimer={setBlockedTimeTimer}
            />

            <div className="keyboard-blocked-text">
              Вы сделали 3 ошибки, поэтому клавиатура заблокирована на <span className="keyboard-blocked-text__time">{blockedTimeTimer} секунд
              </span>
            </div>
          </div>
        )}
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
        {isShowSettings && (
          <Settings
            userData={userData}
            onClose={() => setIsShowSettings(false)}
            setUserData={setUserData}
            onHome={onMenu}
          />
        )}
      </div>
    </div>
  )
}

export default Game 