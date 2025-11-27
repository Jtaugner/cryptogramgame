
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
     ],
     fr: [
          {
              text: "JEU FACILE",
              numbers: [1,2,3,0,4,5,6,7,8,2],
              hiddenIndexes: [1,5],
              filledLetters: {},
              completedNumbers: new Set([])
          },
          {
               text: "TROUVE LE MOT",
               numbers: [6, 2, 9, 3, 5, 1, 0, 8, 1, 0, 7, 9, 6],
               hiddenIndexes: [2, 4, 8, 11],
               filledLetters: {},
               completedNumbers: new Set([])
          },
          {
               text: "BELLE LETTRE",
               numbers: [9, 4, 7, 7, 4, 0, 7, 4, 3, 3, 8, 4],
               hiddenIndexes: [1, 4, 7, 10],
               filledLetters: {},
               completedNumbers: new Set([])
          }
      ],
      es: [
          {
               text: "FRASE FACIL",
               numbers: [7, 6, 3, 8, 5, 0, 7, 3, 9, 4, 2],
               hiddenIndexes: [2, 6],
               filledLetters: {},
               completedNumbers: new Set([])
           },
           {
               text: "ADIVINA PALABRA",
               numbers: [1, 7, 9, 3, 9, 6, 1, 0, 5, 2, 8, 1, 4, 3, 1],
               hiddenIndexes: [2, 4, 6, 11, 14],
               filledLetters: {},
               completedNumbers: new Set([])
           },
           {
               text: "ALMA CLARA",
               numbers: [4, 8, 7, 4, 0, 3, 8, 4, 9, 4],
               hiddenIndexes: [0, 3, 7],
               filledLetters: {},
               completedNumbers: new Set([])
           }
      ],
      de: [
          {
               text: "KLARES SPIEL",
               numbers: [9, 7, 3, 8, 5, 2, 0, 2, 6, 4, 5, 7],
               hiddenIndexes: [1, 4, 9],
               filledLetters: {},
               completedNumbers: new Set([])
           },           
           {
               text: "ERRATE DAS WORT",
               numbers: [5, 8, 8, 3, 7, 5, 0, 2, 3, 6, 0, 4, 9, 8, 7],
               hiddenIndexes: [1, 3, 9, 12],
               filledLetters: {},
               completedNumbers: new Set([])
           },
           {
               text: "KLEINE WELLE",
               numbers: [9, 7, 4, 6, 5, 4, 0, 8, 4, 7, 7, 4],
               hiddenIndexes: [2, 5, 8, 10],
               filledLetters: {},
               completedNumbers: new Set([])
           }                                          
      ],
      it: [
          {
              text: "GIOCO FACILE",
              numbers: [7, 3, 6, 2, 6, 0, 9, 1, 2, 3, 8, 5],
              hiddenIndexes: [3, 10],
              filledLetters: {},
              completedNumbers: new Set([])
          },
          {
              text: "INDOVINA PAROLA",
              numbers: [9, 7, 2, 6, 5, 9, 7, 3, 0, 8, 3, 4, 6, 1, 3],
              hiddenIndexes: [2, 4, 10, 14],
              filledLetters: {},
              completedNumbers: new Set([])
          },
          {
               text: "CASA CALDA",
               numbers: [7, 4, 8, 4, 0, 7, 4, 5, 6, 4],
               hiddenIndexes: [1, 3, 6, 8],
               filledLetters: {},
               completedNumbers: new Set([])
          }
      ]             
     
}

const jumpingLetterIndexes = {
     ru: {number: 2, index: 10},
     en: {number: 8, index: 8},
     fr: {number: 2, index: 9},
     es: {number: 3, index: 7},
     de: {number: 7, index: 11},
     it: {number: 2, index: 8},
}

export function getJumpingLetterIndexes(language: string) {
     return jumpingLetterIndexes[language as keyof typeof jumpingLetterIndexes];
}

const selectedLetterForAdviceStep = {
     ru: 12,
     en: 6,
     fr: 10,
     es: 9,
     de: 11,
     it: 9,
}

export function getSelectedLetterForAdviceStep(language: string) {
     return selectedLetterForAdviceStep[language as keyof typeof selectedLetterForAdviceStep];
}