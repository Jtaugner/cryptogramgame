interface LevelData {
     text: string
     hiddenIndexes: number[]
     name: string
     desc: string
}
let levels: LevelData[] = [
     {
          text: 'БЕЗУМИЕ — ЭТО ДЕЛАТЬ ОДНО И ТО ЖЕ И ЖДАТЬ ДРУГОГО РЕЗУЛЬТАТА.',
          hiddenIndexes: [2, 11, 18, 27, 35, 41, 50],
          name: 'Антон Чехов',
          desc: 'Русский писатель, 1892 год'
        },
        {
          text: 'МЫСЛИ ПРИХОДЯТ, КОГДА НА ИХ ПРИХОД ЕСТЬ МЕСТО.',
          hiddenIndexes: [1, 8, 15, 24, 31, 39, 48],
          name: 'Максим Горький',
          desc: 'Русский писатель, 1901 год'
        },
        {
          text: 'ЖИЗНЬ — ЭТО НЕ ТО, ЧТО МЫ ПОЛУЧАЕМ, А ТО, ЧТО МЫ СОЗДАЕМ.',
          hiddenIndexes: [2, 10, 19, 28, 37, 45, 53],
          name: 'Максим Горький',
          desc: 'Русский писатель, 1902 год'
        },
     {
          text: 'ПУСТЬ ЛУЧШЕ БУДЕТ ПЛОХО, НО ИНТЕРЕСНО.',
          hiddenIndexes: [4, 12, 19, 25, 33],
          name: 'Федор Достоевский',
          desc: 'Русский писатель, философ'
     },
     {
          text: 'КТО НЕ РИСКУЕТ, ТОТ НЕ ПЬЕТ ШАМПАНСКОЕ.',
          hiddenIndexes: [1, 5, 12, 19, 27],
          name: 'Пословица',
          desc: 'Мудрость народов'
     }
]

//Обработка уровней и проверка на ошибки
levels = levels.map(level => {
     level.text = level.text.replace(/Ё/g, 'Е').toUpperCase();
     let test = level.hiddenIndexes;
     level.hiddenIndexes = level.hiddenIndexes.filter(index => /[А-Я]/.test(level.text[index]));
     if(JSON.stringify(test) !== JSON.stringify(level.hiddenIndexes)){
          console.log("fixed");
          console.log(test, level.hiddenIndexes);
     }
     return level;
})


export {levels};