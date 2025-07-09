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
     'poems': 'Литература',
     'aphorisms': 'Афоризмы',
     'music': 'Музыка',
     'cinema': 'Кино',
     'science': 'Наука'
   }

export const namesDescs = {
  'Марк Твен': "Американский писатель, журналист, 1835-1910",
  'Станислав Ежи Лец': "Польский поэт, сатирик, 1909-1966",
  'Аристотель': "Древнегреческий мыслитель, ученик Платона, 384–323 до н. э",
  'Валерий Меладзе': "Российский певец и продюсер, 1965",
  'Омар Хайям': "Персидский и таджикский философ, 1048–1131",
  'Конфуций': "Мыслитель и философ Китая, 551-479 до н. э",
  'Ария': "Российская хеви-метал-группа, 1985",
  'Евгений Онегин': "Роман Александра Сергеевича Пушкина",
  'Алла Пугачева': "Советская и российская эстрадная певица, 1949",
  'Сверхъестественное': 'Сериал, 2005-2020',
  'Альберт Эйнштейн': 'Немецкий физик, 1879-1955',
  'Марина Цветаева': 'Русская поэтесса, 1892-1941',
  'Владимир Высоцкий': 'Советский поэт, 1938-1980',
  'Марк Твен': 'Американский писатель, 1835-1910',
  'Кино': 'Cоветская рок-группа',
  'Теория большого взрыва': 'Сериал, 2007-2019',
  'Уильям Шекспир': 'Английский поэт, драматург, 1564-1616',
  'Уинстон Черчилль': 'Британский государственный деятель, 1874-1965',
  'Друзья': 'Сериал, 1994-2004',
  'Иван Васильевич меняет профессию': 'Фильм, СССР, 1973',
  'Чарли Чаплин': 'Английский киноактёр, кинорежиссёр, 1889-1977',
  'Шерлок': 'Великобритания, сериал, 2010',
  'Сергей Лазарев': 'Российский певец, 1983',
  'Александр Сергеевич Пушкин': 'Российский поэт, 1799-1837',
  'Доктор Хаус': 'Американский телесериал, 2004-2012',
  'Лев Николаевич Толстой': 'Русский писатель, публицист, 1828-1910',
  'Оскар Уайльд': 'Английский писатель, поэт и драматург, 1854-1900',
  'Григорий Лепс': 'Советский и российский певец, 1962',
  'Джентльмены удачи': 'Фильм, СССР, 1971',
  'Москва слезам не верит': 'Фильм, СССР, 1979',
  'Виктор Гюго': 'Французский писатель, 1802-1885',
  'Антон Павлович Чехов': 'Российский писатель, драматург, 1860-1904',
  'Гиппократ': 'Древнегреческий врач и философ, 460-370 до н. э',
  'Бригада': 'Российский телесериал, 2002',
  'Кухня': 'Российский телесериал, 2012',
  'Титаник': 'Американский фильм, 1997',
  'Ирония судьбы, или С лёгким паром!': 'Российский фильм, 1975',
}

export const percentOfLevels ={
  4: '94.6%',
  8: '89.2%',
  12: '76.1%',
  17: '67.5%',
  22: '50.9%',
  28: '43.3%',
  32: '37.7%',
  37: '35.1%',
  48: '33.5%',
  58: '27.9%',
  67: '24.3%',
  72: '24.7%',
  78: '24.1%',
  89: '23.5%',
  100: '22.9%',
  111: '21.6%',
  127: '20.3%',
  139: '19.7%',
  148: '19.1%',
  160: '24.5%',
  172: '17.9%',
  180: '21.3%',
  186: '16.7%',
  200: '16.1%',
  209: '15.5%',
  221: '18.9%',
  236: '21.3%',
  249: '17.7%',
  258: '22.1%',
  265: '17.5%',
  279: '19.9%',
  290: '24.3%',
  301: '20.7%',
  312: '17.1%',
  319: '16.5%',
  333: '15.9%',
  
}
export const getPercentOfLevels = (type: number) => {
     let percents = percentOfLevels[type as keyof typeof percentOfLevels];
     if(percents === undefined){
          return '90.6%';
     }
     return percents;
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