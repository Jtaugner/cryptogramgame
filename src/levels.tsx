export interface LevelData {
     text: string
     hiddenIndexes: number[]
     name: string
     desc: string
     type: string
}
export const levelsData: LevelData[] = [
     {
          text: 'УЖЕ ЗАВТРА, А ТЫ ПРИШЁЛ.',
          hiddenIndexes: [2, 9, 18],
          name: 'Авторская фраза',
          desc: 'Фраза с сарказмом',
          type: 'quotes'
        },
        {
          text: 'В счастье всё-таки желают продолжения.',
          hiddenIndexes: [3,5],
          name: 'Франсуа де Ларошфуко',
          desc: 'Русский писатель, 1892 год',
          type: 'quotes'
        },
        {
          text: 'Собака не ест детей по воскресеньям',
          hiddenIndexes: [3,5],
          name: 'Аргумий Бронк',
          desc: 'Гульмонт, сальбадур, археолог, 1924',
          type: 'quotes'
        },
        {
          text: 'Высший класс — это не то, что вы думаете.',
          hiddenIndexes: [3,5],
          name: 'Антон Чехов',
          desc: 'Русский писатель, 1892 год',
          type: 'quotes'
        },
        {
          text: 'Рыба совсем не проста.',
          hiddenIndexes: [3,5],
          name: 'Что? Где? Когда?',
          desc: 'Телесериал, 2014',
          type: 'quotes'
        },
        {
          text: 'Мысли приходят, когда на их приход есть место.',
          hiddenIndexes: [0, 1, 8, 15, 24, 31, 39, 48],
          name: 'Максим Горький',
          desc: 'Русский писатель, 1901 год',
          type: 'music'
        },
        {
          text: 'Жизнь — это не то, что мы получаем, а то, что мы создаем.',
          hiddenIndexes: [2, 10, 19, 28, 37, 45, 53],
          name: 'Максим Горький',
          desc: 'Русский писатель, 1902 год',
          type: 'quotes'
        },
     {
          text: 'Пусть лучше будет плохо, но интересно.',
          hiddenIndexes: [4, 12, 19, 25, 33],
          name: 'Федор Достоевский',
          desc: 'Русский писатель, философ',
          type: 'quotes'
     },
     {
          text: 'Кто не рискует, тот не пьет шампанское.',
          hiddenIndexes: [1, 5, 12, 19, 27],
          name: 'Пословица',
          desc: 'Мудрость народов',
          type: 'aphorisms'
     },
     {
          text: 'Кто не рискует, тот не пьет шампанское.',
          hiddenIndexes: [1, 5, 12, 19, 27],
          name: 'Пословица',
          desc: 'Мудрость народов',
          type: 'cinema'
     },
     {
          text: 'Кто не рискует, тот не пьет шампанское.',
          hiddenIndexes: [1, 5, 12, 19, 27],
          name: 'Пословица',
          desc: 'Мудрость народов',
          type: 'poems'
     },
     {
          text: 'Кто не рискует, тот не пьет шампанское.',
          hiddenIndexes: [1, 5, 12, 19, 27],
          name: 'Пословица',
          desc: 'Мудрость народов',
          type: 'poems'
     },
     {
          text: 'Кто не рискует, тот не пьет шампанское.',
          hiddenIndexes: [1, 5, 12, 19, 27],
          name: 'Пословица',
          desc: 'Лопська',
          type: 'science'
     },
     {
          text: 'Кто не рискует, тот не пьет шампанское.',
          hiddenIndexes: [1, 5, 12, 19, 27],
          name: 'Байуш ыдячо',
          desc: 'Аывщ народов, 9081',
          type: 'science'
     },
     {
          text: 'Кто не рискует, тот не пьет шампанское.',
          hiddenIndexes: [1, 5, 12, 19, 27],
          name: 'Курдан Военгу',
          desc: 'Мудрость народов',
          type: 'science'
     }
]
export const typesOfCategories = ['quotes', 'poems', 'aphorisms', 'music', 'cinema', 'science'];
export const collectionNames = {
     'quotes': 'Цитаты',
     'poems': 'Поэзия',
     'aphorisms': 'Афоризмы',
     'music': 'Музыка',
     'cinema': 'Кино',
     'science': 'Наука'
   }
export const countWordsWithHiddenLetters = (level: LevelData) => {
     const text = level.text.toUpperCase();
     const hiddenIndexes = new Set(level.hiddenIndexes);
   
     // Удаляем знаки препинания и разбиваем на слова с индексами начала и конца
     const words = [];
     let wordStart = null;
   
     for (let i = 0; i <= text.length; i++) {
       const char = text[i];
       const isLetter = /[А-ЯЁа-яё]/.test(char);
   
       if (isLetter) {
         if (wordStart === null) wordStart = i;
       } else {
         if (wordStart !== null) {
           words.push({ start: wordStart, end: i - 1 });
           wordStart = null;
         }
       }
     }
     // Подсчёт слов, в которых есть хотя бы один индекс из hiddenIndexes
     let count = 0;
     for (const { start, end } of words) {
       for (let i = start; i <= end; i++) {
         if (hiddenIndexes.has(i)) {
           count++;
           break;
         }
       }
     }
   
     return count;
   }
const levelsByCategory: Record<string, LevelData[]> = {
     quotes: [],
     poems: [],
     aphorisms: [],
     music: [],
     cinema: [],
     science: []
}
function replaceLongDashes(text: string) {
     return text.replace(/—/g, '-');
   }
export const formatTime = (seconds: number) => {
     seconds = Math.round(seconds);
     let mins = Math.floor(seconds / 60).toString();
     if(mins.length === 1){
       mins = '0' + mins;
     }
     let secs = (seconds % 60).toString();
     if(secs.length === 1){
       secs = '0' + secs;
     }
     return `${mins}:${secs}`;
   }
//Обработка уровней и проверка на ошибки
const levels = levelsData.map(level => {
     levelsByCategory[level.type as keyof typeof levelsByCategory].push({...level});
     level.text = replaceLongDashes(level.text.toUpperCase().replace(/Ё/g, 'Е'));
     let test = level.hiddenIndexes;
     level.hiddenIndexes = level.hiddenIndexes.filter(index => /[А-Я]/.test(level.text[index]));
     if(JSON.stringify(test) !== JSON.stringify(level.hiddenIndexes)){
          console.log("fixed");
          console.log(test, level.hiddenIndexes);
     }
     return level;
})


export {levels, levelsByCategory};