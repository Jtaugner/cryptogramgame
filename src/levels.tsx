export interface LevelData {
     text: string
     hiddenIndexes: number[]
     name: string
     desc: string
     type: string
}
export const levelsData: LevelData[] = [
     // {
     //      text: 'МЫ ВСЕ НОСИМ МАСКИ, ПРОСТО ИНОГДА ОНИ КРАСИВЕЕ.',
     //      hiddenIndexes: [
     //        0, 1, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14,
     //        16, 17, 18, 19, 21, 22, 23, 25, 26, 27,
     //        29, 30, 31, 33, 34, 35, 36, 38, 39, 40,
     //        41, 43, 44, 45, 46, 48, 49, 50
     //      ],
     // quotes: [],
     // poems: [],
     // aphorisms: [],
     // music: [],
     // cinema: [],
     // science: []
     //      name: 'Маска',
     //      desc: 'Фильм, 1994 год',
     //      type: 'quotes'
     //    },
     {
      text: 'Жизнь — это не то, что мы получаем, а то, что мы создаем.',
      hiddenIndexes: [10, 16, 19, 21, 28, 37, 45, 53],
      name: 'Максим Горький',
      desc: 'Русский писатель, 1902 год',
      type: 'quotes'
    },
        {
          text: 'Такой вот парадокс: мы совершаем подвиги для тех, кому до нас уже нет никакого дела, а любят нас те, кому мы нужны и без всяких подвигов...',
          hiddenIndexes: [3],
          name: 'Франсуа де Ларошфуко',
          desc: 'Русский писатель, 1892 год',
          type: 'cinema'
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
export const getCollectionName = (type: string) => {
     return collectionNames[type as keyof typeof collectionNames];
}
const hints = {
  1: {title: 'Цитаты', text: 'Здесь вы можете узнать тип фразы, которую будете разгадывать'},
  2: {title: 'Ошибки', text: 'После 3 ошибок клавиатура заблокируется на определённое время'}
}
export const getHint = (index: number) => {
     return hints[index as keyof typeof hints];
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
     level.text = replaceLongDashes(level.text.replace(/ё/gi, 'е'));
     let test = level.hiddenIndexes;
     level.hiddenIndexes = level.hiddenIndexes.filter(index => /[а-я]/i.test(level.text[index]));
     if(JSON.stringify(test) !== JSON.stringify(level.hiddenIndexes)){
          console.log("fixed");
          console.log(test, level.hiddenIndexes);
     }
     return level;
})


export const dices = [
  '000010000',
  '000020000',

  '100000001',
  '100000002',
  '200000001',
  '200000002',

  '100010001',
  '100010002',
  '100020001',
  '100020002',
  '200010001',
  '200010002',
  '200020001',
  '200020002',

  '101000101',
  '201000102',
  '102000201',
  '202000202',
  '102000102',
  '201000201',
  '101000202',
  '202000101',

  '101010101',
  '101020101',
  '102010201',
  '201010102',
  '201020102',
  '102020201',

  '202202101',
  '101202202',
  '202101202',
  '101101202',
  '202101101',
  '101202101',
  '102102102',
  '201201201',
]


export {levels, levelsByCategory};