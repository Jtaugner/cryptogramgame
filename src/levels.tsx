// @ts-ignore
import {allLevels} from './allLevels.js';

export interface LevelData {
     text: string
     hiddenIndexes: number[]
     name: string
     desc?: string
     type: string
}
export const levelsData: LevelData[] = allLevels;
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