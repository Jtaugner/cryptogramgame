import React from 'react'
import './Keyboard.css'

interface KeyboardProps {
  onKeyPress: (key: string) => void
  inactiveKeys?: Set<string>
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, inactiveKeys = new Set() }) => {
  const rows = [
    ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'],
    ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
    ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'ъ', 'б', 'ю']
  ]

  return (
    <div className="keyboard-container">
      {rows.map((row, i) => (
        <div key={'keyboard-' + i} className="keyboard-row">
          {row.map(key => (
            <button
              key={key}
              className={`keyboard-key`}
              onClick={() => !inactiveKeys.has(key) && onKeyPress(key)}
              disabled={inactiveKeys.has(key)}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Keyboard 