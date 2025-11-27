export interface LevelData {
     text: string
     hiddenIndexes: number[]
     name: string
     desc?: string
     type: string
}
export const typesOfCategories = ['quotes', 'poems', 'aphorisms', 'music', 'cinema', 'science'];


export let namesDescs: Record<string, string> = {};


export function getInfoAboutName(name: string){
  if(namesDescs[name]){
    return namesDescs[name];
  }
  return '';
  
}

export function cantUpperChar(ch: string){
  return ch === "ß";
}

export function upperCaseSpecial(str: string) {
  let result = "";
  for (const ch of str) {
    result += ch === "ß" ? ch : ch.toUpperCase();
  }
  return result;
}

export const percentOfLevels = [4,8,12,17,22,28,32,37,48,58,67,72,78,89,100,111,127,139,148,160,172,180,186,200,209,221,236,249,258,265,279,290,301,312,319,333];
export const levelToOpenDaily = 19;
export const levelToOpenCalendar = 39;

function generatePercent(number: number) {
  // Быстрее убывающая кривая
  const A = 130;     // чуть выше исходного, чтобы стартовые значения оставались в районе 95+
  const B = 0.08;   // увеличено, чтобы падение было заметно быстрее

  let value = A / (1 + B * number);

  // Периодические колебания ±3
  value += Math.sin(number / 7) * 3;

  // Буст 0..10 примерно в 1/3 случаев
  if (Math.random() < 0.33) {
    value += Math.random() * 10;
  }

  // Небольшой шум ±1
  value += (Math.random() - 0.5) * 2;

  // Жёсткие диапазоны при выходе за пределы
  const MIN = 12;
  const MAX = 96;

  if (value < MIN) {
    // диапазон 15–20, но не ровно 15
    value = 12.1 + Math.random() * (22 - 15.1);
  }

  if (value > MAX) {
    // диапазон 91–96, но не ровно 96
    value = 91 + Math.random() * (96 - 91 - 0.1);
  }

  // Доп. защита
  let r = Number(value.toFixed(1));
  if (r === 15) r = 15.1;
  if (r === 96) r = 95.9;

  return r.toFixed(1) + '%';
}
export const getPercentOfLevels = (type: number) => {
     if(percentOfLevels.includes(type)){
      return generatePercent(type);
     }
     return undefined;
}
export const countWordsWithHiddenLetters = (level: LevelData, gameLanguage: string) => {
     const text = upperCaseSpecial(level.text);
     const hiddenIndexes = new Set(level.hiddenIndexes);
   
     // Удаляем знаки препинания и разбиваем на слова с индексами начала и конца
     const words = [];
     let wordStart = null;
   
     for (let i = 0; i <= text.length; i++) {
       const char = text[i];
       const isLetter = !testLetterForNotAlphabet(char, gameLanguage);
   
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
export let levelsByCategory: Record<string, LevelData[]> = {};
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
export const formatSmallTime = (time: number) => {
  let newTime = time.toString();
  if(newTime.length === 1){
    newTime = '0' + newTime;
  }
  return newTime;
}

//Обработка уровней и проверка на ошибки
const regexForDifferentLanguages = {
     'ru': /[а-я]/i,
     'en': /[a-z]/i,
     'de': /[A-Za-zÄÖÜäöüß]/i,
     'es': /[A-Za-zÁÉÍÓÚáéíóúÑñ]/i,
     'fr': /[A-Za-zÀÂÉÈÊËÎÏÔÙÛÜŸÆÇŒàâéèêëîïôùûüÿæçœ]/i,
     'it': /[A-Za-zÀÈÉÌÒÙàèéìòù]/i
}
export let levels: LevelData[] = [];
export let dailyLevels: LevelData[] = [];

interface LocationLevelsData {
  [key: string]: LevelData[]; 
}
export let locationLevels: LocationLevelsData = {};


function fixLevels(allLevels: LevelData[], language: string, addToCategory: boolean = false){
  const levels = allLevels.map((level: LevelData) => {
      if(addToCategory){
        levelsByCategory[level.type as keyof typeof levelsByCategory].push({...level});  
      }
      level.text = replaceLongDashes(level.text.replace(/ё/gi, 'е'));
      let test = level.hiddenIndexes;
      level.hiddenIndexes = level.hiddenIndexes
      .filter(index => regexForDifferentLanguages[language as keyof typeof regexForDifferentLanguages]
      .test(level.text[index]));

      // if(JSON.stringify(test) !== JSON.stringify(level.hiddenIndexes)){
      //     console.log("fixed");
      //     console.log(level.text);
      //     console.log(test, level.hiddenIndexes);
      // }
      return level;
  })
  return levels;
}

export function initLevels(allLevels: LevelData[], language: string){
  levelsByCategory = {
    quotes: [],
    poems: [],
    aphorisms: [],
    music: [],
    cinema: [],
    science: []
  }
  levels = fixLevels(allLevels, language, true);
  // console.log('levels length');
  // console.log(levels.length);
//   let b = levels.map(c => c.text)

// function findDuplicates(arr) {
//      const seen = new Set();
//      const duplicates = new Set();
   
//      for (const item of arr) {
//        if (seen.has(item)) {
//          duplicates.add(item);
//        } else {
//          seen.add(item);
//        }
//      }
   
//      return [...duplicates];
// }
// console.log("DASDS");
// console.log(findDuplicates(b));
}

export function initDailyLevels(allLevels: LevelData[], language: string){
  dailyLevels = fixLevels(allLevels, language);
}
export function initAllNames(allNamesDesc: Record<string, string>){
  namesDescs = allNamesDesc;
}

export function initLocationLevels(allLevels: LocationLevelsData, language: string){
  Object.keys(allLevels).forEach((key: string) => {
    locationLevels[key] = fixLevels(allLevels[key], language);
  });
}

export const testLetterForNotAlphabet = (char: string, language: string) => {
     if(!char) return true;
     if(char.length > 2) return true;
     return !regexForDifferentLanguages[language as keyof typeof regexForDifferentLanguages].test(char);
}
export const keyboardRows = {
     'ru': [
        ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'],
        ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
        ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'ъ', 'б', 'ю']
     ],
     'en': [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
     ],
    'fr': [
      ['â','ê','é','è','ë','ÿ','ù','û','ü','î','ô'],
      ['à','a','z','e','r','t','y','u','i','ï','o'],
      ['q','s','d','f','g','h','j','k','l','m','p'],
      ['æ','w','x','c','ç','v','b','n','œ']
    ],
    'de': [
      ['q','w','e','r','t','z','u','i','o','p','ü'],
      ['a','s','d','f','g','h','j','k','l','ö','ä'],
      ['y','x','c','v','b','n','m','ß']
    ],
    'es': [
      ['q','w','e','é','r','t','y','u','ú','i','o'],
      ['a','s','d','f','g','h','j','k','l','í','ó'],
      ['á','z','x','c','v','b','n','ñ','m','p']
    ],
    'it': [
      ['q', 'w', 'e', 'é', 'è', 'r', 't', 'y', 'u', 'i', 'o'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ì', 'ò'],
      ['à', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'p', 'ù']
   ]
}

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
  '101000102',
  '201000101',
  // '102000101',
  // '101000201',

  '101010101',
  '101020101',
  '102010201',
  '201010102',
  '201020102',
  '102020201',
  '101010102',
  '102010101',
  '202010101',
  '102010102',

  '202202101',
  '101202202',
  '202101202',
  '101101202',
  '202101101',
  '101202101',
  '102102102',
  '201201201',
  '201202101',
  '101102102',
  '202102101',
  '101201201',
]

