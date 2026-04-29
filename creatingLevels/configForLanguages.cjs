// Per-language validation and filtering rules applied during level generation.
// normalizeYo: replace ё with е (only needed for Russian).
// badWordFilter: run testTextForBadWords() before accepting a phrase (only for Russian).
// foreignScriptRegex: reject phrase if this regex matches (e.g. Cyrillic in English).
// minLen / maxLen: character-length bounds on the raw phrase text.
// excludedNames: phrase.name values to skip (used to be inline `if(phrase.name === ...) continue` in legacy ru/createLevel.cjs).
const configForLanguages = {
    ru: {
         minLen: 100,
         maxLen: 300,
         normalizeYo: true,
         badWordFilter: true,
         foreignScriptRegex: /[a-z]/ig,
         excludedNames: ['Теория большого взрыва', 'Сверхъестественное', 'Доктор Хаус']
   },
    en: { minLen: 0, maxLen: 250, normalizeYo: false, badWordFilter: false, foreignScriptRegex: /[а-я]/ig, excludedNames: [] },
    de: { minLen: 0, maxLen: 300, normalizeYo: false, badWordFilter: false, foreignScriptRegex: null, excludedNames: [] },
    es: { minLen: 0, maxLen: 300, normalizeYo: false, badWordFilter: false, foreignScriptRegex: null, excludedNames: [] },
    fr: { minLen: 0, maxLen: 300, normalizeYo: false, badWordFilter: false, foreignScriptRegex: null, excludedNames: [] },
    it: { minLen: 0, maxLen: 300, normalizeYo: false, badWordFilter: false, foreignScriptRegex: null, excludedNames: [] },
};

module.exports = { configForLanguages };
