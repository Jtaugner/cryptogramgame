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
    <div className="flex flex-row flex-wrap justify-center gap-x-[2px] gap-y-[15px] w-full mb-8 p-0 m-0 py-[10px] px-0">
      {data.text.split(/(\s+)/).map((word, wordIdx, arr) => {
        if (word.trim() === '') {
          return null
        }
        const startIdx = data.text.split(/(\s+)/).slice(0, wordIdx).join('').length;
        const isLastWord = (() => {
          // ищем следующий не-пробельный элемент
          for (let i = wordIdx + 1; i < arr.length; i++) {
            if (arr[i].trim() !== '') return false
          }
          return true
        })();
        const isFirstWord = (() => {
          for (let i = 0; i < wordIdx; i++) {
            if (arr[i].trim() !== '') return false
          }
          return true
        })();
        return (
          <div key={wordIdx} className={`inline-flex flex-row gap-x-[2px] mx-[12px]`}>
            {word.split('').map((letter, i) => {
              const index = startIdx + i;
              const isHidden = data.hiddenIndexes.includes(index)
              const number = data.numbers[index]
              const isLetter = /[А-ЯЁ]/.test(letter)
              const isSelected = selectedIndex === index
              const isCorrect = correctLetters[index]
              const wrongLetter = wrongLetters[index]
              const filledLetter = data.filledLetters[index]
              const shouldShowNumber = isLetter && number > 0 && !hidingNumbers.has(number)
              const isCompletingNumber = number > 0 && completingNumbers.has(number)
              if (!isLetter) {
                return (
                  <span key={index} className="text-[1.8225rem] text-white font-medium uppercase ml-[2px]">
                    {letter}
                  </span>
                )
              }
              return (
                <div 
                  key={index} 
                  className={`
                    flex flex-col items-center w-fit rounded-[2px]
                    ${shouldShowNumber && !(isHidden && !filledLetter) ? 'border border-[#7277ec] border-[1px] shadow-[0_0_0.5px_0.5px_rgba(0,0,0,0.1)]' : ''}
                    ${isHidden ? 'cursor-pointer' : ''}
                    ${isSelected ? 'shadow-[inset_0_0_0_1px_#53e027]' : ''}
                    ${isLetter && number > 0 && !shouldShowNumber ? 'bg-transparent' : ''}
                    ${isLetter && number > 0 && shouldShowNumber ? 'bg-[#6C72F0] rounded-t-[2px]' : ''}
                    ${isHidden && !filledLetter ? 'bg-[rgba(255,255,255,0.9)]' : ''}
                  `}
                  onClick={() => handleLetterClick(index)}
                >
                  <div 
                    className={`
                      w-fit min-w-[1.8225rem] h-[2.43rem] flex items-center justify-center text-[1.8225rem] rounded-[2px]
                      ${isLetter && number > 0 && !shouldShowNumber ? 'bg-[#6C72F0] border border-[#7277ec] border-[1px] shadow-[0_0_0.5px_0.5px_rgba(0,0,0,0.1)]' : ''}
                      ${isLetter && number > 0 ? 'text-white' : !isLetter ? 'text-white' : letter !== '.' ? 'text-[#4a2b2b]' : 'text-gray-600'}
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
                    {isLetter && shouldShowNumber && (
                      <div className={`absolute bottom-0 left-0 w-full border-b ${isSelected ? 'border-[#3db710]' : isHidden && !filledLetter ? 'border-[#6C72F0]' : 'border-white'}`} />
                    )}
                  </div>
                  {isLetter && number > 0 && (
                    <div className={`
                      text-[1.0125rem] ${isSelected ? 'text-[#53e027]' : isHidden && !filledLetter ? 'text-[#6C72F0]' : 'text-white'}
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
      })}
    </div>
  )
})

export default Phrase 