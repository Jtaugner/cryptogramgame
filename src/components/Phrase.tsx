import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import './Phrase.css'
import { LevelDataProps, scrollIntoViewY, UserData } from '../App'
import {dices, LevelData, getInfoAboutName, testLetterForNotAlphabet, upperCaseSpecial } from '../levels'
import { getJumpingLetterIndexes, getSelectedLetterForAdviceStep } from './rulesPhrases';

const gameModes = {
  glagolitic: ['Ⱝ', 'Ⰰ', 'Ⰱ', 'Ⰲ', 'Ⰳ', 'Ⰴ', 'Ⰵ', 'Ⰶ', 'Ⰷ', 'Ⰸ', 'Ⰹ', 'Ⰼ', 'Ⰽ', 'Ⰾ', 'Ⰿ', 'Ⱀ', 'Ⱂ', 'Ⱃ', 'Ⱄ', 'Ⱅ', 'Ⱆ', 'Ⱇ', 'Ⱉ', 'Ⱊ', 'Ⱋ', 'Ⱌ', 'Ⱍ', 'Ⱎ', 'Ⱏ', 'Ⱑ', 'Ⱒ', 'Ⱓ', 'Ⱕ', 'Ⱖ', 'Ⱚ', 'Ⱛ', 'Ⱜ', 'Ⱞ', '𐚨', '𐛌', '𐛍', '𐚬', '𐚪', '𐀍', '𐀐', '𐀐', '𐀪']
};
const assetsBasePath = "./icons1/";

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
  isFromRules?: boolean
  adviceStepFromRules?: boolean
  switchOnGlowScreen: () => void
  levelData: LevelData
  copyFunction: (levelData: LevelData) => void
  setShowConfetti: (show: boolean) => void
  gameMode: string
  playSound: (soundName: string) => void
  inactiveKeys: Set<string>,
  gameLanguage: string,
  userData: UserData
}

interface PhraseHandle {
  handleKeyPress: (key: string) => void
}

export function getTextForLevelEnd(text: string){
  return (<>
    {text.split('\n').map((line, index) => {
      return (
        <span key={'line' + index}>
          {line}
          <br/>
        </span>
      )
    })}
  </>);
}

export let enteredNextLetter: string | undefined = undefined;

export function resetEnteredNextLetter(){
  enteredNextLetter = undefined;
}


const Phrase = forwardRef<PhraseHandle, PhraseProps>(
  ({ data, onError, onLetterFill, onCompleteNumber,
     blockedTime, isTipSelecting, useTip, isLevelCompleted, level,
      isFromRules, adviceStepFromRules,
      switchOnGlowScreen, levelData, copyFunction, setShowConfetti,
      gameMode, playSound, inactiveKeys, gameLanguage, userData }, ref) => {
      
  const letters = data.text.split('')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(-1);
  const [correctLetters, setCorrectLetters] = useState<Record<number, boolean>>({})
  const [wrongLetters, setWrongLetters] = useState<Record<number, string>>({})
  const [completingNumbers, setCompletingNumbers] = useState<Set<number>>(new Set())
  const [hidingNumbers, setHidingNumbers] = useState<Set<number>>(() => new Set(data.completedNumbers))
  const [numberCompleted, setNumberCompleted] = useState<Set<number>>(new Set())
  const [adviceLetterForRules, setAdviceLetterForRules] = useState<boolean>(false)
  const [isLevelAnimationCompleted, setIsLevelAnimationCompleted] = useState(false)

  const timeoutIds = useRef<number[]>([]);


  const updatePhrase = (data: LevelDataProps) => {
    console.log('updatePhrase');
    setSelectedIndex(data.hiddenIndexes[0] ?? null);
    setCorrectLetters({});
    setWrongLetters({});
    setIsLevelAnimationCompleted(false);
    setCompletingNumbers(new Set());
    setHidingNumbers(new Set(data.completedNumbers));
    console.log(new Set(data.completedNumbers));
    setNumberCompleted(new Set());
  }
  // Буквы, разрешённые для игрового ввода

  const handleLetterClick = (index: number) => {
    if(isFromRules) return;
    if (!data.hiddenIndexes.includes(index) || data.filledLetters[index]) return
    enteredNextLetter = "";
    setSelectedIndex(index)
    playSound('changeLetter');
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

  const findNextEmptyIndex = (filledLetters: Record<number, string>) => {
    if(selectedIndex === null) return undefined;
    let nextEmptyIndex = data.hiddenIndexes.find(
      index => index > selectedIndex && !filledLetters[index]
    )      
    // Если не нашли после текущей позиции, ищем с начала фразы
    if (nextEmptyIndex === undefined) {
      nextEmptyIndex = data.hiddenIndexes.find(
        index => index <= selectedIndex && !filledLetters[index]
      )
    }
    return nextEmptyIndex;
  }
  const findPreviousEmptyIndex = (filledLetters: Record<number, string>) => {
    if(selectedIndex === null) return undefined;
    let previousEmptyIndex = undefined;
    let selectedIndexIndex = data.hiddenIndexes.indexOf(selectedIndex);

    for(let i = selectedIndexIndex - 1; i >= 0; i--){
      let index = data.hiddenIndexes[i];
      if(!filledLetters[index]){
        previousEmptyIndex = index;
        break;
      }
    }

    if (previousEmptyIndex === undefined) {
      for(let i = data.hiddenIndexes.length - 1; i >= 0; i--){
        let index = data.hiddenIndexes[i];
        if(!filledLetters[index]){
          previousEmptyIndex = index;
          break;
        }
      }
    }
    return previousEmptyIndex;
  }
  const getNextEmptyIndex = 
      (getPrevious: boolean = false,
      filledLetters: Record<number, string> = data.filledLetters,
      ) => {
    let nextEmptyIndex = findNextEmptyIndex(filledLetters);
    if(getPrevious){
      let prev = findPreviousEmptyIndex(filledLetters);
      if(prev !== undefined){
        nextEmptyIndex = prev;
      }
    }
    //Убираем выделение, если нет пустых клеток
    if (nextEmptyIndex === undefined) {
      setSelectedIndex(null)
    } else {
      setSelectedIndex(nextEmptyIndex)
    }
  }
  const handleKeyPress = (letter: string, doItWhatever?: boolean) => {
    if(selectedIndex === null) return;
    if(inactiveKeys.has(letter.toLowerCase())) return;
    if (!doItWhatever && (blockedTime > 0 || isTipSelecting)) return
    if (Object.keys(wrongLetters).length > 0) return


    
    const isCorrect = letters[selectedIndex].toLowerCase() === letter.toLowerCase()

    if(!isCorrect && typeof enteredNextLetter === 'string' &&
       enteredNextLetter.toLowerCase() === letter.toLowerCase()) return;


    if (isCorrect) {
      enteredNextLetter = letters[selectedIndex+1];
      playSound('goodLetter');
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
          setHidingNumbers(prev => new Set([...prev, currentNumber]))
          // Ждем окончания анимации перед тем как скрыть числа
          playSound('doneLetters');
          switchOnGlowScreen();
          onCompleteNumber(letter)
        }
      }

      timeoutIds.current.push(setTimeout(() => {
        setCorrectLetters(prev => ({ ...prev, [selectedIndex]: false }))
      }, 2000))

      getNextEmptyIndex(false,newFilledLetters);
    } else {
      setWrongLetters(prev => ({ ...prev, [selectedIndex]: letter }))
      playSound('errorLetter');
      onError()
      timeoutIds.current.push(setTimeout(() => {
        setWrongLetters(prev => {
          const newState = { ...prev }
          delete newState[selectedIndex]
          return newState
        })
      }, 1000))
    }
  }

  React.useEffect(() => {
    if(isFromRules) return;
    const handlePhysicalKey = (e: KeyboardEvent) => {
      if(e.key === 'ArrowLeft'){
        getNextEmptyIndex(true);
        playSound('changeLetter');
      }
      if(e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Space'){
        getNextEmptyIndex(false);
        playSound('changeLetter');
      }
      if (Object.keys(wrongLetters).length > 0) return
      let key = upperCaseSpecial(e.key)
      if (key === 'Ё') key = 'Е'
      if (testLetterForNotAlphabet(key, gameLanguage)) return
      console.log(key, gameLanguage);
      handleKeyPress(key)
    }
    window.addEventListener('keydown', handlePhysicalKey)
    return () => {
      window.removeEventListener('keydown', handlePhysicalKey);
    }
  }, [wrongLetters, handleKeyPress])

  useImperativeHandle(ref, () => ({
    handleKeyPress,
    updatePhrase,
    getNextEmptyIndex
  }))

  const scrollToSelected = () => {
    if(!userData.settings.autoScroll) return;
    try{
      let scrollEl = document.querySelector('.selected-glow');
      scrollIntoViewY(document.querySelector('.game-main'), scrollEl, { behavior: 'smooth', align: 'center' });
      // if(scrollEl) scrollEl.scrollIntoView({behavior: 'smooth', block: "center"});
    }catch(ignored){}
  }

  useEffect(() => {
    try{
      if(completingNumbers.size > 0){
        timeoutIds.current.push(setTimeout(() => {
          scrollToSelected()
        }, 1500))
      }else{
        scrollToSelected()
      }
    }catch(ignored){}
  }, [selectedIndex])

  useEffect(() => {
    getNextEmptyIndex(false, data.filledLetters);
    if(adviceStepFromRules){
      setSelectedIndex(getSelectedLetterForAdviceStep(gameLanguage));
      setAdviceLetterForRules(true);
    }

    //Unmount
    return () => {
      timeoutIds.current.forEach(clearTimeout);
    };
  }, [])

  return (
    <div
     className={`phrase-row
       ${isLevelCompleted ? 'levelCompleted' : ''}
       ${isLevelCompleted && isLevelAnimationCompleted ? 'levelFullCompleted' : ''}
       ${completingNumbers.size > 0 ? 'phrase-row_overflowHidden' : ''}
       `}
       onAnimationEnd={(e) => {
          if(e.animationName === 'mainBlockAnim'){
            setIsLevelAnimationCompleted(true);
            setShowConfetti(true);
          }
       }}
    >
      {/* {isLevelCompleted && isLevelAnimationCompleted &&
      <div className="phrase-boom">
                  <Lottie
                    play
                    loop
                    animationData={animationData}
                    // className="phrase-boom"
                    
               />
      </div>
      } */}
      {isLevelCompleted && isLevelAnimationCompleted ?
      <>
        <div className={`phrase-row__text
          ${levelData.text.length > 120 ? 'phrase-row__text_big' : ''}
        `}>
          {getTextForLevelEnd(levelData.text)}
        </div> 
        <div className="game-main_author">
              <div>
                <div className="game-main_author-name">{levelData.name}</div>
                <div className="game-main_author-desc">
                  {getInfoAboutName(levelData.name)}
                </div>
              </div>
              <div className="game-main_copyButton" onClick={() => copyFunction(levelData)}></div>
          </div>
      </>:
      data.text.split(/(\s+)/).map((word, wordIdx, arr) => {
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
              const isLetter = !testLetterForNotAlphabet(letter, gameLanguage)
              const isSelected = selectedIndex === index
              const isCorrect = correctLetters[index]
              const wrongLetter = wrongLetters[index]
              const filledLetter = data.filledLetters[index]
              const shouldShowNumber = isLetter && number > 0 && !hidingNumbers.has(number)
              const isCompletingNumber = number > 0 && completingNumbers.has(number)
              let changeLetterForRules = false;
              let changeLetterForRulesNumber = 0;
              let lastNumberToChangeLetter = false;
              let jumpingLetter = false;
              if(adviceLetterForRules && number === 4 && isHidden){
                changeLetterForRules = true;
                let indexes = [];
                for(let i = 0; i < data.numbers.length; i++){
                  if(data.numbers[i] === 4 && data.hiddenIndexes.includes(i)){
                    indexes.push(i);
                  }
                }
                changeLetterForRulesNumber = indexes.indexOf(index);
                if(changeLetterForRulesNumber === indexes.length - 1){
                  lastNumberToChangeLetter = true;
                }
              }
              if(isFromRules && !adviceLetterForRules){
                let obj = getJumpingLetterIndexes(gameLanguage);
                if((number === obj.number && index === obj.index)){
                  jumpingLetter = true;
                }
              }
              if (!isLetter) {
                return (
                  <span key={index} className="noLetterSymbol text-[1.8225rem] text-white uppercase ml-[2px]" style={{zIndex: isLevelCompleted ? 1 : 0}}>
                    {letter}
                  </span>
                )
              }
              return (
                <div 
                  key={index} 
                  className={`phrase-cell
                    ${isSelected && !isTipSelecting ? 'selected-glow' : ''}
                    ${isHidden ? 'cursor-pointer' : ''}
                    ${isLetter && number > 0 && !shouldShowNumber ? 'phrase-cell_done' : ''}
                    ${isHidden && !filledLetter ? 'phrase-cell_notFilled' : ''}
                    ${numberCompleted.has(number) ? 'numberCompleted' : ''}
                    ${isCorrect || (isCompletingNumber && correctLetters[index]) ? 'correct-letter' : ''} 
                    ${isCompletingNumber ? 'complete-number ' + 'complete-number' + ((index % 3) + 1) : ''} 
                    ${wrongLetter ? 'wrong-letter' : ''} 
                    ${changeLetterForRules ? 'changeLetterForRules changeLetterForRules' + changeLetterForRulesNumber : ''} 
                    ${jumpingLetter ? 'jumping-letter' : ''} 
                  `}
                  onClick={() => handleLetterClick(index)}
                >
                  <div 
                    className={`phrase-cell-inner
                    
                      ${isLetter && number > 0 && !shouldShowNumber ? 'border border-[#7277ec] border-[1px] shadow-[0_0_0.5px_0.5px_rgba(0,0,0,0.1)]' : ''}
                      ${isLetter && number > 0 ? 'text-white' : !isLetter ? 'text-white' : letter !== '.' ? 'text-[#4a2b2b]' : 'text-gray-600'}
                    `}
                  >
                    {(!isHidden || changeLetterForRules) && (
                      <span
                       className={`phrase-cell-letter`}
                       onAnimationEnd={() => {
                        if(changeLetterForRules && lastNumberToChangeLetter){
                          setAdviceLetterForRules(false);
                          timeoutIds.current.push(setTimeout(() => {
                            setAdviceLetterForRules(true);
                          }, 1000));
                        }
                       }}
                       >
                        {upperCaseSpecial(letter)}
                      </span>
                    )}
                    {isHidden && filledLetter && (
                      <span className={`phrase-cell-letter`}>
                        {upperCaseSpecial(filledLetter)}
                      </span>
                    )}
                    {isHidden && wrongLetter && (
                      <span className="phrase-cell-letter absolute inset-0 flex items-center justify-center shake">
                        {upperCaseSpecial(wrongLetter)}
                      </span>
                    )}
                    {isLetter && shouldShowNumber && (
                      <div className={`bottomLine absolute bottom-0 left-0 w-full border-b border-white`} />
                    )}
                  </div>
                  {isLetter && number > 0 && (
                    <div
                     className={`phrase-cell-number`}
                     onAnimationEnd={(e) => {
                          if(e.animationName === 'cellDoneLetterAnimation'){
                            setNumberCompleted(prev => {
                              const updated = new Set(prev)
                              updated.delete(number)
                              return updated
                            })
                            setCompletingNumbers(prev => {
                              const updated = new Set(prev)
                              updated.delete(number)
                              return updated
                            })
                          }else if(e.animationName.indexOf('fallTransform') !== -1){
                            setNumberCompleted(prev => {
                              const updated = new Set(prev)
                              updated.add(number)
                              return updated
                            })
                          }
                     }}
                    >
                      {
                        gameMode === 'dice' ?
                        <div className='dice-cell'>
                          {
                            dices[number - 1].split('').map((dice: string, i: number) => {
                              return (
                                <div
                                 className={`
                                  dice-cell-circle
                                   dice-cell-circle_${dice}
                                   ${numberCompleted.has(number) ? 'zeroOpacity' : ''}
                                   `}
                                key={index + 'dice' + i}>
                                </div>
                              )
                            })
                          }
                        </div>  :
                        gameMode === 'glagolitic' ?
                        <div className={`symbol-cell ${numberCompleted.has(number) ? 'zeroOpacity' : ''}`}
                            style={{
                              maskImage: `url(${assetsBasePath + 'g' + (number-1) + '.svg'})`,
                              WebkitMaskImage: `url(${assetsBasePath + 'g' + (number-1) + '.svg'})`,
                            }}
                        >
                          
                        </div> :
                          <span
                           className={`${numberCompleted.has(number) ? 'zeroOpacity' : ''}`}>
                            {/* {gameMode === 'default' ? number : gameModes[gameMode as keyof typeof gameModes][number]} */}
                            {gameMode === 'default' && number }
                          </span>
                      }
                      
                      
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