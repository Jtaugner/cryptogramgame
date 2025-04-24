import React, { forwardRef, useImperativeHandle } from 'react'

interface PhraseProps {
  data: {
    text: string
    numbers: number[]
    hiddenIndexes: number[]
    filledLetters: Record<number, string>
    completedNumbers: Set<number>
  }
  onError: () => void
  onLetterFill: (filledLetters: Record<number, string>) => void
  onCompleteNumber: (letter: string) => void
}

interface PhraseHandle {
  handleKeyPress: (key: string) => void
}

const Phrase = forwardRef<PhraseHandle, PhraseProps>(({ data, onError, onLetterFill, onCompleteNumber }, ref) => {
  const letters = data.text.split('')
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(() => {
    return data.hiddenIndexes[0] ?? null
  })
  const [correctLetters, setCorrectLetters] = React.useState<Record<number, boolean>>({})
  const [wrongLetters, setWrongLetters] = React.useState<Record<number, string>>({})
  const [completingNumbers, setCompletingNumbers] = React.useState<Set<number>>(new Set())
  const [hidingNumbers, setHidingNumbers] = React.useState<Set<number>>(() => new Set(data.completedNumbers))

  const handleLetterClick = (index: number) => {
    if (!data.hiddenIndexes.includes(index)) return
    setSelectedIndex(index)
  }

  const handleKeyPress = (letter: string) => {
    if (selectedIndex === null) return
    
    const isCorrect = letters[selectedIndex].toLowerCase() === letter.toLowerCase()

    if (isCorrect) {
      setCorrectLetters(prev => ({ ...prev, [selectedIndex]: true }))
      const newFilledLetters = { ...data.filledLetters, [selectedIndex]: letter }
      
      // Сразу обновляем букву
      onLetterFill(newFilledLetters)
      
      // Проверяем, есть ли еще пустые клетки для этого числа
      const currentNumber = data.numbers[selectedIndex]
      if (currentNumber > 0) {
        const hasEmptySlots = letters.some((_, index) => 
          data.numbers[index] === currentNumber && 
          data.hiddenIndexes.includes(index) && 
          !newFilledLetters[index]
        )

        if (!hasEmptySlots) {
          setCompletingNumbers(prev => new Set([...prev, currentNumber]))
          // Ждем окончания анимации перед тем как скрыть числа
          setTimeout(() => {
            setCompletingNumbers(prev => {
              const updated = new Set(prev)
              updated.delete(currentNumber)
              return updated
            })
            setHidingNumbers(prev => new Set([...prev, currentNumber]))
            // Передаем завершенную букву
            onCompleteNumber(letter)
          }, 2000)
        }
      }

      setTimeout(() => {
        setCorrectLetters(prev => ({ ...prev, [selectedIndex]: false }))
      }, 2000)

      // Ищем следующую пустую клетку сначала после текущей позиции
      let nextEmptyIndex = data.hiddenIndexes.find(
        index => index > selectedIndex && !newFilledLetters[index]
      )
      
      // Если не нашли после текущей позиции, ищем с начала фразы
      if (nextEmptyIndex === undefined) {
        nextEmptyIndex = data.hiddenIndexes.find(
          index => index < selectedIndex && !newFilledLetters[index]
        )
      }

      // Если пустых клеток больше нет, убираем выделение
      if (nextEmptyIndex === undefined) {
        setSelectedIndex(null)
      } else {
        setSelectedIndex(nextEmptyIndex)
      }
    } else {
      setWrongLetters(prev => ({ ...prev, [selectedIndex]: letter }))
      onError()

      setTimeout(() => {
        setWrongLetters(prev => {
          const newState = { ...prev }
          delete newState[selectedIndex]
          return newState
        })
      }, 1500)
    }
  }

  useImperativeHandle(ref, () => ({
    handleKeyPress
  }))

  return (
    <div className="flex flex-wrap justify-center gap-x-0 gap-y-4 mb-8">
      {letters.map((letter, index) => {
        const isHidden = data.hiddenIndexes.includes(index)
        const number = data.numbers[index]
        const isLetter = /[А-ЯЁ]/.test(letter)
        const isSelected = selectedIndex === index
        const isCorrect = correctLetters[index]
        const wrongLetter = wrongLetters[index]
        const filledLetter = data.filledLetters[index]
        const shouldShowNumber = isLetter && number > 0 && !hidingNumbers.has(number)
        const isCompletingNumber = number > 0 && completingNumbers.has(number)
        
        if (letter === ' ') {
          return <div key={index} className="w-4" />
        }

        if (letter === '-') {
          return <div key={index} className="w-4 flex items-center">-</div>
        }

        return (
          <div 
            key={index} 
            className={`
              flex flex-col items-center w-fit
              ${isHidden ? 'cursor-pointer' : ''}
              ${isSelected ? 'outline outline-2 outline-green-500 outline-offset-1 rounded bg-green-100' : ''}
            `}
            onClick={() => handleLetterClick(index)}
          >
            <div 
              className={`
                w-fit min-w-[1.5rem] h-8 flex items-center justify-center text-xl
                bg-transparent
                ${letter !== '.' ? 'text-[#4a2b2b]' : 'text-gray-600'}
                font-medium
                relative
                mb-0.5
                uppercase
              `}
            >
              {!isHidden && (
                <span className={isCompletingNumber ? 'number-complete' : ''}>
                  {letter}
                </span>
              )}
              {isHidden && filledLetter && (
                <span className={`
                  ${isCorrect || (isCompletingNumber && correctLetters[index]) ? 'correct-letter' : ''} 
                  ${isCompletingNumber ? 'number-complete' : ''}
                `}>
                  {filledLetter.toUpperCase()}
                </span>
              )}
              {isHidden && wrongLetter && (
                <span className="absolute inset-0 flex items-center justify-center text-red-600 shake">
                  {wrongLetter.toUpperCase()}
                </span>
              )}
              {isLetter && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[45%] border-b border-gray-400" />
              )}
            </div>
            {isLetter && number > 0 && (
              <div className={`
                text-xs text-gray-500
                ${!shouldShowNumber ? 'opacity-0' : ''}
                transition-opacity duration-200
              `}>
                {number}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
})

export default Phrase 