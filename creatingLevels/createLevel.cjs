const { captureRejectionSymbol } = require('events');
const { promises: fsp } = require('fs');
var path = require('path');
let language = 'en';
doUpdate = false;
// var {dailyLevels} = require('./dailyLevelsTexts.js');
// var {locationLevels} = require('./locationCitats.js');
const { levelsData } = require(`./${language}/output.js`);
let dailyLevelsTexts = require(`./${language}/dailyLevelsTexts.js`);
let allLevels = require(`../src/levels/${language}/allLevels.js`);
let allNames = require(`../src/levels/${language}/allNames.js`);
let allDailyLevels = require(`../src/levels/${language}/dailyLevels.js`);
allLevels = allLevels.default;
allNames = allNames.default;
dailyLevelsTexts = dailyLevelsTexts.default;

const allLevelsTexts = [];
const typesOfCategories = ['quotes', 'poems', 'aphorisms', 'music', 'cinema', 'science'];
let notUsedTypes = typesOfCategories.slice();

const DELETE_ALL_BEFORE = false;
if(DELETE_ALL_BEFORE){
     allLevels = [];
     // allNames = {};
}

allLevels.forEach(level => {
     allLevelsTexts.push(level.text);
});

const dataForLanguages = {
     ru: {
         vowels: 'АЕЁИОУЫЭЮЯ',
         consonants: 'БВГДЖЗЙКЛМНПРСТФХЦЧШЩ',
         notLettersRegex: /[^А-Яа-яЁё]/gi,
         isLetterRegex: /[А-Яа-яЁё]/i,
         definitions: 'Определения и понятия'
     },
 
     en: {
         vowels: 'AEIOUY',
         consonants: 'BCDFGHJKLMNPQRSTVWXZ',
         notLettersRegex: /[^A-Za-z]/gi,
         isLetterRegex: /[A-Za-z]/i,
         definitions: 'Definitions'
     },
 
     de: {
         vowels: 'AEIOUYÄÖÜ',
         consonants: 'BCDFGHJKLMNPQRSTVWXZß',
         notLettersRegex: /[^A-Za-zÄÖÜäöüß]/gi,
         isLetterRegex: /[A-Za-zÄÖÜäöüß]/i,
         definitions: 'Definitionen und Begriffe'
     }, 
     es: {
         vowels: 'AEIOUÁÉÍÓÚÜ',
         consonants: 'BCDFGHJKLMNÑPQRSTVWXZ',
         notLettersRegex: /[^A-Za-zÁÉÍÓÚáéíóúÑñ]/gi,
         isLetterRegex: /[A-Za-zÁÉÍÓÚáéíóúÑñ]/i,
         definitions: 'Definiciones y conceptos'
     },
 
     fr: {
         vowels: 'AEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛÜŸ',
         consonants: 'BCDFGHJKLMNPQRSTVWXZÇ',
         notLettersRegex: /[^A-Za-zÀÂÉÈÊËÎÏÔÙÛÜŸÆÇŒàâéèêëîïôùûüÿæçœ]/ig,
         isLetterRegex: /[A-Za-zÀÂÉÈÊËÎÏÔÙÛÜŸÆÇŒàâéèêëîïôùûüÿæçœ]/i,
         definitions: 'Définitions et notions'
     },
 
     it: {
         vowels: 'AEIOUÀÈÉÌÍÒÓÙÚ',
         consonants: 'BCDFGHJKLMNPQRSTVWXZ',
         notLettersRegex: /[^A-Za-zÀÈÉÌÒÙàèéìòù]/gi,
         isLetterRegex: /[A-Za-zÀÈÉÌÒÙàèéìòù]/i,
         definitions: 'Definizioni e concetti'
     }
 }
 

function generateCryptogram(phrase, complexity = 3, fullness = 0.05) {
     const vowels = new Set(dataForLanguages[language].vowels);
     const consonants = new Set(dataForLanguages[language].consonants);
   
     // Убираем всё, кроме букв
     const onlyLetters = phrase.replace(dataForLanguages[language].notLettersRegex, '');
     const totalLetters = onlyLetters.length;
     // console.log(phrase, onlyLetters);
   
     // Подсчёт частот букв в этой фразе
     const freqMap = {};
     for (let ch of onlyLetters.toUpperCase()) {
       freqMap[ch] = (freqMap[ch] || 0) + 1;
     }
   
     // Сортируем по убыванию частоты
     const sortedByFrequency = Object.entries(freqMap)
       .sort((a, b) => b[1] - a[1] || a[0].charCodeAt(0))
       .map(entry => entry[0]);

   
     // Выбираем N самых частых букв
     const visibleLetters = new Set();
     let rand = Math.random();
     if(rand < 0.55){
        visibleLetters.add(sortedByFrequency[0]);
     }else{
        visibleLetters.add(sortedByFrequency[1]);
     }

     let startedIndex = 5;
     if(complexity === 0) startedIndex = 11;
     if(complexity <= 2){
          for(let i = 0; i < startedIndex; i++){
               visibleLetters.add(sortedByFrequency[i]);
          }
     }
     if(complexity <= 1){
          for(let i = startedIndex; i < Math.round(sortedByFrequency.length * 0.75); i++){
               visibleLetters.add(sortedByFrequency[i]);
          }
     }
   
     // Обеспечим хотя бы одну гласную
     if (![...visibleLetters].some(l => vowels.has(l))) {
       for (let ch of sortedByFrequency) {
         if (vowels.has(ch)) {
           visibleLetters.add(ch);
           break;
         }
       }
     }
   
     // Обеспечим хотя бы одну согласную
     if (![...visibleLetters].some(l => consonants.has(l))) {
       for (let ch of sortedByFrequency) {
         if (consonants.has(ch)) {
           visibleLetters.add(ch);
           break;
         }
       }
     }

     //Добавим две редкие буквы
     visibleLetters.add(sortedByFrequency[sortedByFrequency.length - 2]);
     visibleLetters.add(sortedByFrequency[sortedByFrequency.length - 3]);


     if(complexity === 3){
        //Добавляем букву по-середине
        visibleLetters.add(sortedByFrequency[Math.floor(sortedByFrequency.length / 2)]);
     }
   
   
     // Определим позиции всех букв
     const letterPositions = {};
     for (let i = 0; i < phrase.length; i++) {
       const ch = phrase[i];
       const upper = ch.toUpperCase();
       if (dataForLanguages[language].isLetterRegex.test(ch)) {
         if (!letterPositions[upper]) letterPositions[upper] = [];
         letterPositions[upper].push(i);
       }
     }

     // Обрезаем лишнее, если перебрали
     const finalVisibleLetters = Array.from(visibleLetters);
   
     // Для каждой видимой буквы выбираем случайный индекс
     const visibleLetterIndexes = {};

     for (let letter of finalVisibleLetters) {
       const positions = letterPositions[letter];
       if (positions?.length > 0) {
         const index = positions[Math.floor(Math.random() * positions.length)];
         visibleLetterIndexes[letter] = index;
       }
     }

     const showLetterIndexes = new Set(Object.values(visibleLetterIndexes));

     let tries = 0;
     while(showLetterIndexes.size/totalLetters < fullness){
        let randIndex = Math.floor(Math.random() * phrase.length);
        const upper = phrase[randIndex].toUpperCase();
        if(finalVisibleLetters.includes(upper)){
           showLetterIndexes.add(randIndex);
        }
        tries++;
        if(tries > 300){
             return null;
        }
     }
   
     const cryptogram = [];
     const hiddenIndexes = [];
   
     for (let i = 0; i < phrase.length; i++) {
       const ch = phrase[i];
       let isLetter = dataForLanguages[language].isLetterRegex.test(ch);
       if (isLetter && showLetterIndexes.has(i)) {
         cryptogram.push(ch);
       } else if (isLetter) {
         cryptogram.push('•');
         hiddenIndexes.push(i);
       } else {
         cryptogram.push(ch);
       }
     }
     return {
       original: phrase,
       cryptogram: cryptogram.join(''),
       visibleLetters: finalVisibleLetters,
       visibleLetterIndexes,
       hiddenIndexes,
       totalLetters
     };
   }
   
   
function replaceLongDashes(text) {
     return text.replace(/—/g, '-');
}   
   
//Генерация уровней
// let allQuotes = [];
// Object.keys(phrases).forEach((key, index) => {
//      allQuotes.push(...phrases[key]);
// });

let allQuotes = levelsData;

const results = [];
const complexity = 4;
const fullness = 0.05;
console.log('allQuotes.length', allQuotes.length);


allQuotes = shuffleArray(allQuotes);


function testTextForBadWords(text){
     let badWords = ['секс', 'овуляц', 'оргазм', 'сперм', 'мастурбац', 'пенис', 'вагин', 'минет', 'клитор',
          'героин', 'экстази', 'амфетамин', 'кокаин', 'марихуан', 'изнасилова', 'гей'
     ]
     text = text.toLowerCase();
     for(let word of badWords){
          if(text.indexOf(word) !== -1){
               // console.log(word);
               return true;
          }
     }
     return false;
}
function trimRandom(arr, targetSize) {
     if (targetSize < 0) targetSize = 0;
     if (targetSize >= arr.length) return arr;
   
     while (arr.length > targetSize) {
       const index = Math.floor(Math.random() * arr.length);
       arr.splice(index, 1);
     }
   
     return arr;
   }
   

function createLevel(phrase, complexity, fullness){
     // console.log(complexity, fullness);
     let text = phrase.text;
     text = replaceLongDashes(text);
     text = text.trim();
     //Если в конце нет знака препинания, то ставим точку
     if(dataForLanguages[language].isLetterRegex.test(text[text.length-1])){
          text += '.'
     }
     if(allLevelsTexts.includes(text)){
          return null;
     }
     allLevelsTexts.push(text);
     let level = generateCryptogram(text, complexity, fullness);
     if(level === null) return createLevel(phrase, complexity, fullness);
     let test = level.hiddenIndexes;
     level.hiddenIndexes = level.hiddenIndexes.filter(index => dataForLanguages[language].isLetterRegex.test(text[index]));
     const levelData = {};
     levelData.text = text;
     levelData.hiddenIndexes = level.hiddenIndexes;
     levelData.name = phrase.name;
     levelData.type = phrase.type;
     return levelData;
}

//Первая генерация уровней
console.log('start generate')
if(allLevels.length === 0){
     //Ищем маленькие уровни в начале списка
     let allSmallQuotes = [];
     for(let i = 0; i < allQuotes.length; i++){
          let quote = allQuotes[i];
          if(quote.text.length < 50){
               allSmallQuotes.push(quote);
          }
     }
     //Первые 3 уровня малыши
     

     let level1 = createLevel(allSmallQuotes[0], 0, 0.85)
     level1.hiddenIndexes = trimRandom(level1.hiddenIndexes, 4);
     allLevels.push(level1);

     let level2 = createLevel(allSmallQuotes[1], 0, 0.8)
     level2.hiddenIndexes = trimRandom(level2.hiddenIndexes, 6);
     allLevels.push(level2);

     let level3 = createLevel(allSmallQuotes[2], 1, 0.7)
     level3.hiddenIndexes = trimRandom(level3.hiddenIndexes, 10);
     allLevels.push(level3);

     //4 уровня
     addWordsToLevelsUntill(4, 30, 50, 1, 0.8);
     //6 уровней
     addWordsToLevelsUntill(6, 30, 70, 1, 0.7);
     addWordsToLevelsUntill(8, 50, 85, 1, 0.6);
     addWordsToLevelsUntill(10, 60, 100, 2, 0.5);
     addWordsToLevelsUntill(12, 70, 120, 2, 0.4);
     addWordsToLevelsUntill(15, 70, 140, 3, 0.3);
     addWordsToLevelsUntill(20, 50, 150, 3, 0.2);
     addWordsToLevelsUntill(25, 50, 180, 3, 0.1);
     addWordsToLevelsUntill(500, 40, 250, 3, 0.05);
}else{
     addWordsToLevelsUntill(800, 50, 270, 3, 0.05);
}





function addWordsToLevelsUntill(untill, minLength, maxLength, complexity, fullness){
     while(allLevels.length !== untill){
          let index = Math.floor(Math.random() * allQuotes.length);
          let phrase = allQuotes[index];
          let text = phrase.text;
          if(text.length < minLength || text.length > maxLength){
               continue;
          }
          //Если тип не новый, то пропускаем
          if(!notUsedTypes.includes(phrase.type) && Math.random() < 0.97){
               continue;
          }     
     
          let level = createLevel(phrase, complexity, fullness);
          if(level === null){
               continue;
          }
          let typeIndex = notUsedTypes.indexOf(phrase.type);
          if(typeIndex !== -1){
               notUsedTypes.splice(typeIndex, 1);
               if(notUsedTypes.length === 0){
                    notUsedTypes = typesOfCategories.slice();
               }
          }
          // console.log(phrase.type);
          allQuotes.splice(index, 1);
          allLevels.push(level);
     }
}





console.log(allLevels.length);


//Daily levels

let newDailyLevels = [];
let isAddDaily = false;

if(dailyLevelsTexts.length > allDailyLevels.length){
     isAddDaily = true;
     newDailyLevels = [...allDailyLevels];
     for(let i = allDailyLevels.length; i < dailyLevelsTexts.length; i++){
          text = dailyLevelsTexts[i];
          let level = createLevel({
               text: text,
               name: dataForLanguages[language].definitions,
               type: 'science'
          }, 3, 0.05);
          newDailyLevels.push(level);
     }
}





//Добавить ещё слова в allNames
allLevels.forEach(level => {
     if(!allNames[level.name]){
          allNames[level.name] = "";
     }
});
allQuotes.forEach(quote => {
     if(!allNames[quote.name]){
          allNames[quote.name] = "";
     }
});
// newLocationLevels.forEach(level => {
//      if(!allNames[level.name]){
//           allNames[level.name] = 1;
//      }else{
//           allNames[level.name]++;
//      }
// });


// console.log(sorted);
   


function shuffleArray(array) {
     for (let i = array.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [array[i], array[j]] = [array[j], array[i]];
     }
     return array
}


if(doUpdate){
     fsp.writeFile(path.join(__dirname, '..', 'src', 'levels', language, 'allNames.js'),
     `export default ${JSON.stringify(allNames, null, 2)}`);
    
    fsp.writeFile(path.join(__dirname, '..', 'src', 'levels', language, 'allLevels.js'),
     `export default [
     ${allLevels.map(result => '\n' + JSON.stringify(result) )}
     \n]`);
    
    if(isAddDaily){
         fsp.writeFile(path.join(__dirname, '..', 'src', 'levels', language, 'dailyLevels.js'),
         `export default [
         ${newDailyLevels.map(result => '\n' + JSON.stringify(result) )}
         \n]`);
    }
}



 
module.exports = {
     createLevel: createLevel
};

 