import { useState, useEffect, useRef } from 'react'
import Keyboard from './Keyboard'
import Phrase from './Phrase'
import './Game.css'
import ProgressCircle from '../ProgressCircle'

interface LevelData {
  text: string
  hiddenIndexes: number[]
  name: string
  desc: string
}
interface GameProps {
  onMenu: () => void
  userData: {
    iq: number
    lastLevel: number
    lastLevelData: object
    tips: number
  }
  setUserData: (userData: {
    iq: number
    lastLevel: number
    lastLevelData: object
    tips: number
  }) => void
}

const Game: React.FC<GameProps> = ({ onMenu, userData, setUserData }) => { 
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(309)
  const [isLevelCompleted, setIsLevelCompleted] = useState(false)
  const [isTipSelecting, setIsTipSelecting] = useState(false)
  const [errors, setErrors] = useState(2)
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
  const phraseRef = useRef<{ handleKeyPress: (key: string) => void }>(null)

  // Тестовые данные для первого уровня
  const levelData: LevelData =   {
    text: 'НЕТ НИЧЕГО СИЛЬНЕЕ ЭТИХ ДВУХ ВОИНСТВУЮЩИХ СИЛ — ВРЕМЕНИ И ТЕРПЕНИЯ.',
    hiddenIndexes: [2, 8, 15, 23, 32, 39, 48, 57],
    name: 'Лев Толстой',
    desc: 'Русский писатель, 1869 год'
  };
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
      setTimeout(()=>{
        setIsLevelCompleted(true)
      }, 4000);
    }
  }, [phraseData])

  const generateNumbersForLetters = (text: string) => {
    // Преобразуем текст в верхний регистр
    text = text.toUpperCase()
    
    const letterMap = new Map<string, number>()
    const numbers: number[] = []

    text.split('').forEach((char) => {
      // Пропускаем знаки препинания и пробелы
      if (/[^А-ЯЁ]/.test(char)) {
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

  useEffect(() => {
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
  }, [])

    const guessedPercent = phraseData
    ? Math.round(
        (Object.keys(phraseData.filledLetters).length / phraseData.hiddenIndexes.length) * 100
      )
    : 0

  if (!phraseData) return null

  return (
    <div className="game-bg">
      {isTipSelecting && <div className="game-bg-blackout"></div>}
      {isLevelCompleted && <div className="game-bg-blur"></div>}
      {/* Header */}
      <div className={`game-header ${isLevelCompleted ? 'game-header_hidden' : ''}`}>
        <div className="game-header-wrap">
          <div className="menu-settings-btn" onClick={onMenu} style={{opacity: isTipSelecting ? 0 : 1}}></div>
          <div className='game-header_sameSize' style={{opacity: isTipSelecting ? 0 : 1}}>{guessedPercent}%</div>
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
           <div className='game-header_sameSize' style={{opacity: isTipSelecting ? 0 : 1}}>Ур. {level}</div>
           <div className={`menu-tips-btn ${isTipSelecting ? 'menu-tips-btn_close' : ''}`} onClick={switchTipSelecting}>
              <div className="menu-tips-btn__count" style={{opacity: isTipSelecting ? 0 : 1}}>{userData.tips}</div>
           </div>
        </div>
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
        />
        {isLevelCompleted && (
          <div className="game-main_author">
            <div className="game-main_author-name">{levelData.name}</div>
            <div className="game-main_author-desc">{levelData.desc}</div>
          </div>
        )}
        {isLevelCompleted && (
          <div className="nextLevelButton">
            <div className="nextLevelButton-text">ДАЛЕЕ</div>
            <div className="nextLevelButton-level">Уровень {level + 1}</div>
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
          <div className="keyboard-tip-text">
            Выберите ячейку, которую вы хотите открыть
          </div>
        )}
      </div>
    </div>
  )
}

export default Game 