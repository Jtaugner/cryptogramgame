// Pure helper module — no top-level side effects, no file writes, no console output.
// All mutable generation state (allLevels, allLevelsTexts, allQuotes, etc.) is owned
// by the caller (createLevel.cjs) and threaded through as parameters.

const { dataForLanguages } = require('./dataForLanguages.cjs');

// Copied verbatim from createLevel.cjs lines 81–218, with `language` promoted to a
// parameter instead of reading the outer variable.
function generateCryptogram(phrase, language, complexity = 3, fullness = 0.05) {
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


// Copied verbatim from createLevel.cjs lines 221–223.
function replaceLongDashes(text) {
    return text.replace(/—/g, '-');
}

// Copied verbatim from createLevel.cjs lines 242–254.
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

// Copied verbatim from createLevel.cjs lines 255–265.
function trimRandom(arr, targetSize) {
    if (targetSize < 0) targetSize = 0;
    if (targetSize >= arr.length) return arr;

    while (arr.length > targetSize) {
      const index = Math.floor(Math.random() * arr.length);
      arr.splice(index, 1);
    }

    return arr;
  }

// Copied verbatim from createLevel.cjs lines 268–291, with `language` promoted to a
// parameter and `allLevelsTexts` threaded through so the function has no hidden state.
function createLevel(phrase, language, complexity, fullness, allLevelsTexts){
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
    let level = generateCryptogram(text, language, complexity, fullness);
    if(level === null) return createLevel(phrase, language, complexity, fullness, allLevelsTexts);
    level.hiddenIndexes = level.hiddenIndexes.filter(index => dataForLanguages[language].isLetterRegex.test(text[index]));
    const levelData = {};
    levelData.text = text;
    levelData.hiddenIndexes = level.hiddenIndexes;
    levelData.name = phrase.name;
    levelData.type = phrase.type;
    return levelData;
}

// Copied verbatim from createLevel.cjs lines 338–366, with outer-scope variables
// (allLevels, allQuotes, notUsedTypes, typesOfCategories) threaded through as a state
// object so the function has no hidden mutable dependencies.
function addWordsToLevelsUntill(untill, minLength, maxLength, complexity, fullness, language, state){
    // state: { allLevels, allQuotes, notUsedTypes, typesOfCategories, allLevelsTexts }
    while(state.allLevels.length !== untill){
         let index = Math.floor(Math.random() * state.allQuotes.length);
         let phrase = state.allQuotes[index];
         let text = phrase.text;
         if(text.length < minLength || text.length > maxLength){
              continue;
         }
         //Если тип не новый, то пропускаем
         if(!state.notUsedTypes.includes(phrase.type) && Math.random() < 0.97){
              continue;
         }

         let level = createLevel(phrase, language, complexity, fullness, state.allLevelsTexts);
         if(level === null){
              continue;
         }
         let typeIndex = state.notUsedTypes.indexOf(phrase.type);
         if(typeIndex !== -1){
              state.notUsedTypes.splice(typeIndex, 1);
              if(state.notUsedTypes.length === 0){
                   state.notUsedTypes = state.typesOfCategories.slice();
              }
         }
         // console.log(phrase.type);
         state.allQuotes.splice(index, 1);
         state.allLevels.push(level);
    }
}

// Copied verbatim from createLevel.cjs lines 422–428.
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

module.exports = {
    generateCryptogram,
    createLevel,
    replaceLongDashes,
    shuffleArray,
    trimRandom,
    testTextForBadWords,
    addWordsToLevelsUntill
};
