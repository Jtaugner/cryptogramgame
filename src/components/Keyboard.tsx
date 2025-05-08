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
    <div className="flex flex-col gap-y-[10px]">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-x-[6px]">
          {row.map(key => (
            <button
              key={key}
              className={`
                w-[1.7rem] h-[2.5rem] rounded
                flex items-center justify-center
                text-[1.325rem] font-medium uppercase
                ${inactiveKeys.has(key) 
                  ? 'bg-gray-200 text-gray-400 cursor-default' 
                  : 'bg-[rgba(255,255,255,0.9)] text-gray-700 active:bg-gray-100'}
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