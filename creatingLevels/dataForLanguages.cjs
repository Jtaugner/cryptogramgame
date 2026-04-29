// Per-language alphabet and regex configuration.
// levelTarget: total allLevels count to generate. null = skip level loop.
const dataForLanguages = {
    ru: {
        vowels: 'АЕЁИОУЫЭЮЯ',
        consonants: 'БВГДЖЗЙКЛМНПРСТФХЦЧШЩ',
        notLettersRegex: /[^А-Яа-яЁё]/gi,
        isLetterRegex: /[А-Яа-яЁё]/i,
        definitions: 'Определения и понятия',
        levelTarget: 4000,
        phraseSourceFile: 'newCitats.js',
        phraseSourceExport: 'phrases',
        dailySourceExport: 'dailyLevels'
    },

    en: {
        vowels: 'AEIOUY',
        consonants: 'BCDFGHJKLMNPQRSTVWXZ',
        notLettersRegex: /[^A-Za-z]/gi,
        isLetterRegex: /[A-Za-z]/i,
        definitions: 'Definitions',
        levelTarget: 450,
        phraseSourceFile: 'output.js',
        phraseSourceExport: 'levelsData',
        dailySourceExport: 'default'
    },

    de: {
        vowels: 'AEIOUYÄÖÜ',
        consonants: 'BCDFGHJKLMNPQRSTVWXZß',
        notLettersRegex: /[^A-Za-zÄÖÜäöüß]/gi,
        isLetterRegex: /[A-Za-zÄÖÜäöüß]/i,
        definitions: 'Definitionen und Begriffe',
        levelTarget: null,
        phraseSourceFile: 'output.js',
        phraseSourceExport: 'levelsData',
        dailySourceExport: 'default'
    },

    es: {
        vowels: 'AEIOUÁÉÍÓÚÜ',
        consonants: 'BCDFGHJKLMNÑPQRSTVWXZ',
        notLettersRegex: /[^A-Za-zÁÉÍÓÚáéíóúÑñ]/gi,
        isLetterRegex: /[A-Za-zÁÉÍÓÚáéíóúÑñ]/i,
        definitions: 'Definiciones y conceptos',
        levelTarget: null,
        phraseSourceFile: 'output.js',
        phraseSourceExport: 'levelsData',
        dailySourceExport: 'default'
    },

    fr: {
        vowels: 'AEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛÜŸ',
        consonants: 'BCDFGHJKLMNPQRSTVWXZÇ',
        notLettersRegex: /[^A-Za-zÀÂÉÈÊËÎÏÔÙÛÜŸÆÇŒàâéèêëîïôùûüÿæçœ]/ig,
        isLetterRegex: /[A-Za-zÀÂÉÈÊËÎÏÔÙÛÜŸÆÇŒàâéèêëîïôùûüÿæçœ]/i,
        definitions: 'Définitions et notions',
        levelTarget: null,
        phraseSourceFile: 'output.js',
        phraseSourceExport: 'levelsData',
        dailySourceExport: 'default'
    },

    it: {
        vowels: 'AEIOUÀÈÉÌÍÒÓÙÚ',
        consonants: 'BCDFGHJKLMNPQRSTVWXZ',
        notLettersRegex: /[^A-Za-zÀÈÉÌÒÙàèéìòù]/gi,
        isLetterRegex: /[A-Za-zÀÈÉÌÒÙàèéìòù]/i,
        definitions: 'Definizioni e concetti',
        levelTarget: null,
        phraseSourceFile: 'output.js',
        phraseSourceExport: 'levelsData',
        dailySourceExport: 'default'
    }
};

module.exports = { dataForLanguages };
