import React, { useEffect, useState } from 'react'
import './Keyboard.css'

interface KeyboardProps {
  onKeyPress: (key: string) => void
  inactiveKeys?: Set<string>
  phraseData?: {
    text: string
    numbers: number[]
    hiddenIndexes: number[]
    filledLetters: Record<number, string>
  }
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, inactiveKeys = new Set(), phraseData }) => {
  const rows = [
    ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'],
    ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
    ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'ъ', 'б', 'ю']
  ]
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log('dasds');
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
    console.log(usedLetters);
    setUsedLetters(usedLetters);
    }, [phraseData])

  return (
    <div className="keyboard-container">
      {rows.map((row, i) => (
        <div key={'keyboard-' + i} className="keyboard-row">
          {row.map(key => (
            <div
              key={key}
              className={`
                keyboard-key
                ${usedLetters.has(key) ? 'keyboard-key_used' : ''}
                ${inactiveKeys.has(key) ? 'keyboard-key_inactive' : ''}`}
              onClick={() => !inactiveKeys.has(key) && onKeyPress(key)}
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