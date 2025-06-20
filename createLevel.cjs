const { promises: fsp } = require('fs');
var path = require('path');
var {phrases} = require('./citats');
const {allLevels} = require('./src/allLevels.js');
console.log(allLevels[0]);


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
   
   
   
   
//Генерация уровней
const results = [];
const complexity = 3;
const fullness = 0.15;

let quotes = phrases.science;
// quotes.forEach((quote, index) => {
//      console.log(index, quote.text);
// });
for(let i = 0; i < 10; i++){
     let index = 36;
     const phrase = quotes[index];
     let text = phrase.text;
     const levelData = {};
     const level = generateCryptogram(text, complexity, fullness);
     text = text.trim();

     //Если в конце нет знака препинания, то ставим точку
     if(/[А-Яа-яЁё]/.test(text[text.length-1])){
          text += '.'
     }
     levelData.text = text;
     levelData.hiddenIndexes = level.hiddenIndexes;
     levelData.name = phrase.name;
     levelData.desc = phrase.desc;
     levelData.type = phrase.type;

     results.push(levelData);

}

/*
Object.keys(phrases).forEach((key, index) => {
     console.log(key,phrases[key].length);
});

const allQuotes = [];
Object.keys(phrases).forEach((key, index) => {
     allQuotes.push(...phrases[key]);
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

fsp.writeFile(path.join(__dirname, 'levelsList.js'),
 `${results.map(result => JSON.stringify(result)) + ',\n'}`);


 