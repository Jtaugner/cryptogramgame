import { useState, useEffect, useRef } from 'react'
import Keyboard from './Keyboard'
import Phrase from './Phrase'
import bgSpring from '../assets/bgSpring-big.png'

interface LevelData {
  text: string
  hiddenIndexes: number[]
  name: string
  desc: string
}

const Game = () => {
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(309)
  const [errors, setErrors] = useState(0)
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
  const levelData: LevelData = {
    text: 'Я ОБО ВСЕМ ПОДУМАЮ ПОТОМ, КОГДА НАЙДУ В СЕБЕ СИЛЫ ЭТО ВЫДЕРЖАТЬ.',
    hiddenIndexes: [2, 6, 13, 20, 26, 33, 38, 45, 50, 56],
    name: 'Неизвестный автор',
    desc: 'Сильные слова о внутренней борьбе'
  };

  const handleCompleteNumber = (letter: string) => {
    setInactiveKeys(prev => new Set([...prev, letter.toLowerCase()]))
  }

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

  if (!phraseData) return null

  return (
    <div className="h-screen flex flex-col bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgSpring})` }}>
      {/* Header */}
      <div className="sticky top-0 z-10 w-full bg-transparent">
        <div className="flex justify-between items-start p-4">
          <div className="flex items-center">
            <div className="relative">
              <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                {lives}
              </div>
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                +
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm">Ошибки</div>
            <div className="flex gap-1 mt-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${i < errors ? 'bg-red-500' : 'bg-gray-300'}`} 
                />
              ))}
            </div>
          </div>
          <div className="text-gray-500 text-sm">
            Уровень {level}
          </div>
        </div>
      </div>

      {/* Settings and Info buttons */}
      <button className="absolute top-4 left-4 text-gray-500">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <button className="absolute top-4 right-4 text-gray-500">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Main content (Phrase + Hint) */}
      <div className="flex-1 w-full flex flex-col items-center overflow-y-auto">
        <Phrase 
          ref={phraseRef}
          data={phraseData}
          onError={() => setErrors(prev => prev + 1)}
          onLetterFill={handleLetterFill}
          onCompleteNumber={handleCompleteNumber}
        />
        {/* Hint button */}
        <div className="absolute bottom-24 right-4">
          <button className="bg-blue-500 text-white rounded-lg p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Keyboard */}
      <div className="w-full max-w-2xl mx-auto bg-[#313477] sticky bottom-0 left-0 p-[10px_6px]">
        <Keyboard 
          onKeyPress={(key) => phraseRef.current?.handleKeyPress(key)} 
          inactiveKeys={inactiveKeys}
        />
      </div>
    </div>
  )
}

export default Game 