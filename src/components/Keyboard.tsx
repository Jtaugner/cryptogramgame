import React, { useEffect, useState } from 'react'
import './Keyboard.css'
import { cantUpperChar, keyboardRows } from '../levels'
import { useUniformKeyboardKeyFont } from './useUniformKeyboardKeyFont'

interface KeyboardProps {
  onKeyPress: (key: string) => void
  inactiveKeys?: Set<string>
  phraseData?: {
    text: string
    numbers: number[]
    hiddenIndexes: number[]
    filledLetters: Record<number, string>
  }
  gameLanguage: string
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, inactiveKeys = new Set(), phraseData, gameLanguage }) => {
  const [rows, setRows] = useState<string[][]>(keyboardRows[gameLanguage as keyof typeof keyboardRows]);
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set());
  const keyboardRef = useUniformKeyboardKeyFont<HTMLDivElement>();

  useEffect(() => {
    if(!phraseData) return;
    let usedLetters = new Set<string>();
    const letterPositions = new Map<number, { letter: string, positions: number[] }>()

    // Собираем все позиции для каждого числа
    phraseData.text.split('').forEach((letter, index) => {
      const number = phraseData.numbers[index]
      if (number === 0) return

      if (!letterPositions.has(number)) {
        letterPositions.set(number, { letter, positions: [] })
      }
      letterPositions.get(number)!.positions.push(index)
    })
    let filledLetters = Object.values(phraseData.filledLetters);

    // Проверяем каждое число
    letterPositions.forEach(({ letter, positions }, number) => {
      // Проверяем, все ли позиции этого числа скрыты
      const allHidden = positions.every(pos => phraseData.hiddenIndexes.includes(pos))
      if (!allHidden) {
        usedLetters.add(letter.toLowerCase());
      }
    })
    usedLetters = new Set([...usedLetters, ...filledLetters]);
    // console.log(usedLetters);
    setUsedLetters(usedLetters);
    }, [phraseData])

  return (
    <div className="keyboard-container" ref={keyboardRef}>
      {rows.map((row, i) => (
        <div key={'keyboard-' + i} className="keyboard-row">
          {row.map(key => (
            <div
              key={key}
              className={`
                keyboard-key
                ${usedLetters.has(key) ? 'keyboard-key_used' : ''}
                ${inactiveKeys.has(key.toLowerCase()) ? 'keyboard-key_inactive' : ''}
                ${cantUpperChar(key) ? 'keyboard-key_cantUpper' : ''}
                `
                
              }
              onClick={() => !inactiveKeys.has(key.toLowerCase()) && onKeyPress(key)}
            >
              {key}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Keyboard 