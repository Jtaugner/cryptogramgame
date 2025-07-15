
export const levelPhraseRules = {
     ru: [
          {
               text:"ИГРА ПРОСТА",
               numbers:[1,8,7,2,0,9,7,4,5,6,2],
               hiddenIndexes:[3,6],
               filledLetters:{},
               completedNumbers:new Set([1,8,4,5,6,9])
          },
          {
               text:"УГАДАЙ СЛОВО",
               numbers:[1,2,3,4,3,5,0,6,7,8,9,8],
               hiddenIndexes:[2,4,8,9,11],
               filledLetters:{},
               completedNumbers:new Set([1,2,4,5,6,9])
          },
          {
               text:"ШИНШИЛЛА ПИЩИТ",
               numbers:[6,4,3,6,4,1,1,5,0,8,4,5,4,9],
               hiddenIndexes:[1,4,10,13],
               filledLetters:{},
               completedNumbers:new Set([3,5,6,1,5,8])
          }
     ],
     en: [
          {
               text:"GAME IS EASY",
               numbers:[1,2,7,8,0,9,3,0,8,2,3,6],
               hiddenIndexes:[3,9],
               filledLetters:{},
               completedNumbers:new Set([1,7,9,3,6])
          },
          {
               text:"GUESS THE WORD",
               numbers:[9,18,3,4,4,0,5,1,3,0,6,2,17,11],
               hiddenIndexes:[3,4,8,11],
               filledLetters:{},
               completedNumbers:new Set([9,18,5,1,6,17,11])
          },
          {
               text:"HAPPY PUPPY",
               numbers:[2,1,4,4,5,0,4,9,4,4,5],
               hiddenIndexes:[2,3,8,9,10],
               filledLetters:{},
               completedNumbers:new Set([2,1,9])
          }
     ]
}