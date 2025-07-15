const { promises: fsp } = require('fs');
var path = require('path');
// var {phrases} = require('./citats');
var {phrases} = require('./englishCitats.js');
const allLevelsEN = require('./src/allLevels-en.js');

const allLevels = allLevelsEN.default;

const allLevelsTexts = [];

allLevels.forEach(level => {
     allLevelsTexts.push(level.text);
});




function generateCryptogram(phrase, complexity = 3, fullness = 0.05) {
     const vowels = new Set('AEIOU');
     const consonants = new Set('BCDFGHJKLMNPQRSTVWXYZ');
   
     // Убираем всё, кроме букв
     const onlyLetters = phrase.replace(/[^A-Za-z]/gi, '');
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

     console.log(visibleLetters);
   
   
     // Определим позиции всех букв
     const letterPositions = {};
     for (let i = 0; i < phrase.length; i++) {
       const ch = phrase[i];
       const upper = ch.toUpperCase();
       if (/[A-Za-z]/.test(ch)) {
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
   
       if (/[A-Za-z]/.test(ch) && showLetterIndexes.has(i)) {
         cryptogram.push(ch);
       } else if (/[A-Za-z]/.test(ch)) {
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

// console.log(allNamesWithoutDescs);

while(allLevels.length !== 250){
     let index = Math.floor(Math.random() * allQuotes.length);
     let phrase = allQuotes[index];
     let text = phrase.text;
     text = replaceLongDashes(text.replace(/ё/gi, 'е'));
     if(/[а-я]/ig.test(text) || text.length > 250){
          continue;
     }

     //Если тип не новый, то пропускаем
     if(!notUsedTypes.includes(phrase.type)){
          continue;
     }
     let typeIndex = notUsedTypes.indexOf(phrase.type);
     if(typeIndex !== -1){
          notUsedTypes.splice(typeIndex, 1);
          if(notUsedTypes.length === 0){
               notUsedTypes = typesOfCategories.slice();
          }
     }



     let level = generateCryptogram(text, complexity, fullness);
     let test = level.hiddenIndexes;
     level.hiddenIndexes = level.hiddenIndexes.filter(index => /[a-z]/i.test(text[index]));
     if(JSON.stringify(test) !== JSON.stringify(level.hiddenIndexes)){
          console.log("fixed");
          console.log(test, level.hiddenIndexes);
     }
     text = text.trim();

     //Если в конце нет знака препинания, то ставим точку
     if(/[A-Za-z]/ig.test(text[text.length-1])){
          text += '.'
     }
          //Если текст уже есть, то пропускаем
     if(allLevelsTexts.includes(text)){
          continue;
     }
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
   


fsp.writeFile(path.join(__dirname, 'allNames-en.js'),
 `const allNames = {${Object.keys(sorted).map(name => `'${name}': ""`).join(',\n')}}`);


fsp.writeFile(path.join(__dirname, 'levelsList-en.js'),
 `const allLevelsEN = [
 ${allLevels.map(result => '\n' + JSON.stringify(result) )}
 \n]`);


 