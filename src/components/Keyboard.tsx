interface KeyboardProps {
  onKeyPress: (key: string) => void
  inactiveKeys?: Set<string>
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, inactiveKeys = new Set() }) => {
  const rows = [
    ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
    ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
    ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'ё']
  ]

  return (
    <div className="flex flex-col gap-1">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1">
          {row.map(key => (
            <button
              key={key}
              className={`
                w-8 h-10 rounded
                flex items-center justify-center
                text-lg font-medium
                ${inactiveKeys.has(key) 
                  ? 'bg-gray-200 text-gray-400 cursor-default' 
                  : 'bg-white text-gray-700 active:bg-gray-100'}
              `}
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