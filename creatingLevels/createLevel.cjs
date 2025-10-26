const { promises: fsp } = require('fs');
var path = require('path');
// var {phrases} = require('./citats');
var {phrases} = require('./newCitats.js');
var {dailyLevels} = require('./dailyLevelsTexts.js');
let allLevels = require('../src/allLevels.js');
allLevels = allLevels.default;

const allLevelsTexts = [];

allLevels.forEach(level => {
     allLevelsTexts.push(level.text);
});
// const hasLowerThenUpper = str => /[a-zа-яё][A-ZА-ЯЁ]/.test(str);
// allLevelsTexts.forEach(text => {
//      if(hasLowerThenUpper(text)){
//           console.log(text);
//      }
// });
// return;




function generateCryptogram(phrase, complexity = 3, fullness = 0.05) {
     const vowels = new Set('АЕЁИОУЫЭЮЯ');
     const consonants = new Set('БВГДЖЗЙКЛМНПРСТФХЦЧШЩ');
   
     // Убираем всё, кроме букв
     const onlyLetters = phrase.replace(/[^А-Яа-яЁё]/g, '');
     const totalLetters = onlyLetters.length;
   
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

     const startedIndex = 5;
     if(complexity === 1 || complexity === 2){
          for(let i = 0; i < startedIndex; i++){
               visibleLetters.add(sortedByFrequency[i]);
          }
     }
     if(complexity === 1){
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
       if (/[А-Яа-яЁё]/.test(ch)) {
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


     while(showLetterIndexes.size/totalLetters < fullness){
        let randIndex = Math.floor(Math.random() * phrase.length);
        const upper = phrase[randIndex].toUpperCase();
        if(finalVisibleLetters.includes(upper)){
           showLetterIndexes.add(randIndex);
        }
     }
   
     const cryptogram = [];
     const hiddenIndexes = [];
   
     for (let i = 0; i < phrase.length; i++) {
       const ch = phrase[i];
       const upper = ch.toUpperCase();
   
       if (/[А-Яа-яЁё]/.test(ch) && showLetterIndexes.has(i)) {
         cryptogram.push(ch);
       } else if (/[А-Яа-яЁё]/.test(ch)) {
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

let allQuotes = phrases;

const results = [];
const complexity = 4;
const fullness = 0.05;
console.log('allQuotes.length', allQuotes.length);

function shuffleArray(array) {
     for (let i = array.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [array[i], array[j]] = [array[j], array[i]];
     }
     return array
}

allQuotes = shuffleArray(allQuotes);


let typeBefore = allLevels[allLevels.length - 1].type;

const typesOfCategories = ['quotes', 'poems', 'aphorisms', 'music', 'cinema', 'science'];
let notUsedTypes = typesOfCategories.slice();

console.log(allLevels.length);

let allNamesWithoutDescs = new Set;
allLevels.forEach(level => {
     if(level.desc === ''){
          allNamesWithoutDescs.add(level.name);
     }
     if(level.name.length > 25){
          console.log(level.name);
     }
});

console.log(allNamesWithoutDescs);

function testTextForBadWords(text){
     let badWords = ['секс', 'овуляц', 'оргазм', 'сперм', 'мастурбац', 'пенис', 'вагин', 'минет', 'клитор',
          'героин', 'экстази', 'амфетамин', 'кокаин', 'марихуан', 'изнасилова', 'гей'
     ]
     for(let word of badWords){
          if(text.indexOf(word) !== -1){
               // console.log(word);
               return true;
          }
     }
     return false;
}

while(allLevels.length !== 2220){
     let index = Math.floor(Math.random() * allQuotes.length);
     let phrase = allQuotes[index];
     let text = phrase.text;
     text = replaceLongDashes(text.replace(/ё/gi, 'е'));
     if(/[a-z]/ig.test(text) || text.length < 150 || text.length > 300 || testTextForBadWords(text)){
          continue;
     }

     //Если тип не новый, то пропускаем
     if(!notUsedTypes.includes(phrase.type) && Math.random() < 0.97){
          continue;
     }

     text = text.trim();

     //Если в конце нет знака препинания, то ставим точку
     if(/[А-Яа-яЁё]/.test(text[text.length-1])){
          text += '.'
     }


     let level = generateCryptogram(text, complexity, fullness);
     let test = level.hiddenIndexes;
     level.hiddenIndexes = level.hiddenIndexes.filter(index => /[а-я]/i.test(text[index]));
     if(JSON.stringify(test) !== JSON.stringify(level.hiddenIndexes)){
          // console.log("fixed");
          // console.log(test, level.hiddenIndexes);
     }

     //Если текст уже есть, то пропускаем
     if(allLevelsTexts.includes(text)){
          continue;
     }
     let typeIndex = notUsedTypes.indexOf(phrase.type);
     if(typeIndex !== -1){
          notUsedTypes.splice(typeIndex, 1);
          if(notUsedTypes.length === 0){
               notUsedTypes = typesOfCategories.slice();
          }
     }
     console.log(phrase.name);
     const levelData = {};
     levelData.text = text;
     levelData.hiddenIndexes = level.hiddenIndexes;
     levelData.name = phrase.name;
     levelData.desc = phrase.desc;
     levelData.type = phrase.type;

     allQuotes.splice(index, 1);

     allLevelsTexts.push(text);
     allLevels.push(levelData);
     // console.log(levelData.type);
}


console.log(allLevels.length);

let newDailyLevels = [];

dailyLevels.forEach(text => {
     text = replaceLongDashes(text.replace(/ё/gi, 'е'));
     if(/[a-z]/ig.test(text)){
          return;
     }
     text = text.trim();
     //Если в конце нет знака препинания, то ставим точку
     if(/[А-Яа-яЁё]/.test(text[text.length-1])){
          text += '.'
     }
     let level = generateCryptogram(text, complexity, fullness);
     let test = level.hiddenIndexes;
     level.hiddenIndexes = level.hiddenIndexes.filter(index => /[а-я]/i.test(text[index]));
     if(JSON.stringify(test) !== JSON.stringify(level.hiddenIndexes)){
          console.log("fixed");
          console.log(test, level.hiddenIndexes);
     }
     const levelData = {};
     levelData.text = text;
     levelData.hiddenIndexes = level.hiddenIndexes;
     levelData.name = 'Определения и понятия'
     levelData.desc = '';
     levelData.type = 'quotes';
     newDailyLevels.push(levelData);
});


/*
Object.keys(phrases).forEach((key, index) => {
     console.log(key,phrases[key].length);
});

let maxWord = 0;
let maxWordName = '';
let maxWordQuote = '';
allQuotes.forEach(quote => {
     let words = quote.text.split(/[\s\n]+/)
     for(let word of words){
          if(word.length > maxWord){
               maxWord = word.length;
               maxWordName = word;
               maxWordQuote = quote.text;
          }
     }
     let name = quote.name;
     if(name.length > maxWord){
          maxWord = name.length;
          maxWordName = name;
     }
});
console.log('maxWord', maxWord);
console.log(maxWordQuote);
console.log(maxWordName);*/

let allNames = {};

allLevels.forEach(level => {
     if(!allNames[level.name]){
          allNames[level.name] = 1;
     }else{
          allNames[level.name]++;
     }
});

const sorted = Object.fromEntries(
     Object.entries(allNames).sort(([, v1], [, v2]) => v2 - v1)
);

// console.log(sorted);
   


fsp.writeFile(path.join(__dirname, 'allNames.js'),
 `const allNames = {${Object.keys(sorted).map(name => `'${name}': ""`).join(',\n')}}`);
 


fsp.writeFile(path.join(__dirname, 'levelsList.js'),
 `const levels = [
 ${allLevels.map(result => '\n' + JSON.stringify(result) )}
 \n]`);

 fsp.writeFile(path.join(__dirname, 'dailyLevelsList.js'),
 `const dailyLevels = [
 ${newDailyLevels.map(result => '\n' + JSON.stringify(result) )}
 \n]`);


 