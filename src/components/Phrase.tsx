import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import './Phrase.css'

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
  blockedTime: number
  isTipSelecting: boolean
  useTip: () => void
  isLevelCompleted: boolean
  level: number
}

interface PhraseHandle {
  handleKeyPress: (key: string) => void
}

const emojis = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇',
  '🙂','🙃','😉','😌','😍','😘','😗','😙','😚','😋',
  '😜','😝','😛','🤑','🤗','🤭','🤫','🤔','🤐','🤨',
  '😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔',
  '😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶',
  '😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁',
  '☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰',
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
  '🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔',
  '🍎','🍌','🍇','🍓','🍉','🍑','🍍','🥝','🥥','🥑'
];


const Phrase = forwardRef<PhraseHandle, PhraseProps>(
  ({ data, onError, onLetterFill, onCompleteNumber,
     blockedTime, isTipSelecting, useTip, isLevelCompleted, level }, ref) => {
      
  const letters = data.text.split('')
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(() => {
    return data.hiddenIndexes[0] ?? null
  })
  const [correctLetters, setCorrectLetters] = React.useState<Record<number, boolean>>({})
  const [wrongLetters, setWrongLetters] = React.useState<Record<number, string>>({})
  const [completingNumbers, setCompletingNumbers] = React.useState<Set<number>>(new Set())
  const [hidingNumbers, setHidingNumbers] = React.useState<Set<number>>(() => new Set(data.completedNumbers))
  const [numberCompleted, setNumberCompleted] = React.useState<Set<number>>(new Set())



  const updatePhrase = (data: {
    text: string
    numbers: number[]
    hiddenIndexes: number[]
    filledLetters: Record<number, string>
    completedNumbers: Set<number>
  }) => {
    setSelectedIndex(data.hiddenIndexes[0] ?? null);
    setCorrectLetters({});
    setWrongLetters({});
    setCompletingNumbers(new Set());
    setHidingNumbers(new Set(data.completedNumbers));
    setNumberCompleted(new Set());
  }
  // Буквы, разрешённые для игрового ввода
  const allowedKeys = [
    'Й','Ц','У','К','Е','Н','Г','Ш','Щ','З','Х',
    'Ф','Ы','В','А','П','Р','О','Л','Д','Ж','Э',
    'Я','Ч','С','М','И','Т','Ь','Ъ','Б','Ю'
  ]

  const handleLetterClick = (index: number) => {
    if (!data.hiddenIndexes.includes(index) || data.filledLetters[index]) return
    setSelectedIndex(index)
    if(index === selectedIndex){
      openLetterByTip();
    }
  }
  const openLetterByTip = () => {
    if(selectedIndex !== null && isTipSelecting){
      useTip();
      handleKeyPress(letters[selectedIndex], true);
    }
  }
  useEffect(() => {
    openLetterByTip();
  }, [selectedIndex])

  const handleKeyPress = (letter: string, doItWhatever?: boolean) => {
    if(selectedIndex === null) return
    if (!doItWhatever && (blockedTime > 0 || isTipSelecting)) return
    if (Object.keys(wrongLetters).length > 0) return
    
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
            // Добавляем numberCompleted на 2 секунды
            setNumberCompleted(prev => {
              const updated = new Set(prev)
              updated.add(currentNumber)
              return updated
            })
            setTimeout(() => {
              setNumberCompleted(prev => {
                const updated = new Set(prev)
                updated.delete(currentNumber)
                return updated
              })
            }, 3000)
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
      console.log(data.hiddenIndexes, nextEmptyIndex, data.text[nextEmptyIndex]);
      
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

  React.useEffect(() => {
    const handlePhysicalKey = (e: KeyboardEvent) => {
      if (Object.keys(wrongLetters).length > 0) return
      let key = e.key.toUpperCase()
      if (key === 'Ё') key = 'Е'
      if (/[^А-ЯЁ]/.test(key)) return
      if (!allowedKeys.includes(key)) return
      handleKeyPress(key)
    }
    window.addEventListener('keydown', handlePhysicalKey)
    return () => window.removeEventListener('keydown', handlePhysicalKey)
  }, [wrongLetters, handleKeyPress])

  useImperativeHandle(ref, () => ({
    handleKeyPress,
    updatePhrase
  }))

  useEffect(() => {
    try{
      let scrollEl = document.querySelector('.selected-glow');
      if(scrollEl) scrollEl.scrollIntoView({behavior: 'smooth', block: "center"});
    }catch(ignored){}
  }, [selectedIndex])

  return (
    <div className={`phrase-row ${isLevelCompleted ? 'levelCompleted' : ''}`}>
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
          <div key={wordIdx} className="phrase-word">
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
                  <span key={index} className="text-[1.8225rem] text-white uppercase ml-[2px]" style={{zIndex: isLevelCompleted ? 1 : 0}}>
                    {letter}
                  </span>
                )
              }
              return (
                <div 
                  key={index} 
                  className={`phrase-cell
                    ${isSelected && !isTipSelecting ? 'selected-glow' : ''}
                    ${shouldShowNumber && !(isHidden && !filledLetter) ? 'border border-[#7277ec] border-[1px] shadow-[0_0_0.5px_0.5px_rgba(0,0,0,0.1)]' : ''}
                    ${isHidden ? 'cursor-pointer' : ''}
                    ${isLetter && number > 0 && !shouldShowNumber ? 'bg-transparent phrase-cell_done' : ''}
                    ${isLetter && number > 0 && shouldShowNumber ? 'bg-[#6C72F0] rounded-t-[2px]' : ''}
                    ${isHidden && !filledLetter ? 'phrase-cell_notFilled' : ''}
                    ${numberCompleted.has(number) ? 'numberCompleted' : ''}
                    ${isCorrect || (isCompletingNumber && correctLetters[index]) ? 'correct-letter' : ''} 
                    ${isCompletingNumber ? 'complete-number' : ''} 
                    ${wrongLetter ? 'wrong-letter' : ''} 
                  `}
                  onClick={() => handleLetterClick(index)}
                >
                  <div 
                    className={`phrase-cell-inner
                    
                      ${isLetter && number > 0 && !shouldShowNumber ? 'bg-[#6C72F0] border border-[#7277ec] border-[1px] shadow-[0_0_0.5px_0.5px_rgba(0,0,0,0.1)]' : ''}
                      ${isLetter && number > 0 ? 'text-white' : !isLetter ? 'text-white' : letter !== '.' ? 'text-[#4a2b2b]' : 'text-gray-600'}
                    `}
                  >
                    {!isHidden && (
                      <span>
                        {letter}
                      </span>
                    )}
                    {isHidden && filledLetter && (
                      <span className={`
                        
                      `}>
                        {filledLetter.toUpperCase()}
                      </span>
                    )}
                    {isHidden && wrongLetter && (
                      <span className="absolute inset-0 flex items-center justify-center shake">
                        {wrongLetter.toUpperCase()}
                      </span>
                    )}
                    {isLetter && shouldShowNumber && (
                      <div className={`absolute bottom-0 left-0 w-full border-b border-white`} />
                    )}
                  </div>
                  {isLetter && number > 0 && (
                    <div className={`phrase-cell-number
                      ${isSelected ? 'text-[#3db710]' : isHidden && !filledLetter ? 'text-[#6C72F0]' : 'text-white'}
                      transition-opacity duration-200
                    `}>
                      
                      <span className={`${shouldShowNumber ? '' : 'opacity-0'}`}>
                        {number}
                      </span>
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