const { promises: fsp } = require('fs');
var path = require('path');

const { dataForLanguages } = require('./dataForLanguages.cjs');
const { configForLanguages } = require('./configForLanguages.cjs');
const {
    createLevel,
    shuffleArray,
    trimRandom,
    testTextForBadWords,
    addWordsToLevelsUntill
} = require('./generator.cjs');

const VALID_LANGS = Object.keys(dataForLanguages);

const USAGE = `Usage: node creatingLevels/createLevel.cjs --lang <code> [--update] [--delete-all-before]

Generates cryptogram levels for the given language and (with --update) writes
the result to src/levels/<lang>/.

Languages: ${VALID_LANGS.join(', ')}

Flags:
  --lang <code>         Required. One of: ${VALID_LANGS.join(', ')}
  --update              Write generated levels to src/levels/<lang>/. Default: false.
  --delete-all-before   Discard existing allLevels before generating. Default: false.
  --help, -h            Print this message and exit.
`;

function parseArgs(argv) {
    const args = argv.slice(2);
    const result = { language: null, doUpdate: false, deleteAllBefore: false };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--help' || arg === '-h') {
            process.stdout.write(USAGE);
            process.exit(0);
        } else if (arg === '--update') {
            result.doUpdate = true;
        } else if (arg === '--delete-all-before') {
            result.deleteAllBefore = true;
        } else if (arg === '--lang') {
            const code = args[i + 1];
            if (!code || code.startsWith('--')) {
                process.stderr.write('Error: --lang requires a language code.\n\n' + USAGE);
                process.exit(1);
            }
            result.language = code;
            i++; // consume the value
        } else {
            process.stderr.write(`Error: unknown flag "${arg}".\n\n` + USAGE);
            process.exit(1);
        }
    }

    if (!result.language) {
        process.stderr.write('Error: --lang is required.\n\n' + USAGE);
        process.exit(1);
    }

    if (!VALID_LANGS.includes(result.language)) {
        process.stderr.write(`Error: invalid language "${result.language}". Valid values: ${VALID_LANGS.join(', ')}\n\n` + USAGE);
        process.exit(1);
    }

    return result;
}

const typesOfCategories = ['quotes', 'poems', 'aphorisms', 'music', 'cinema', 'science'];

async function runCli() {
    const { language, doUpdate, deleteAllBefore } = parseArgs(process.argv);

    let allLevels = require(`../src/levels/${language}/allLevels.js`);
    allLevels = allLevels.default;

    const langConfig = configForLanguages[language];
    const langData = dataForLanguages[language];
    const levelTarget = langData.levelTarget;

    const phraseMod = require(`./${language}/${langData.phraseSourceFile}`);
    let allQuotes = phraseMod[langData.phraseSourceExport];
    if (!Array.isArray(allQuotes)) {
        throw new Error(`Expected array from ${langData.phraseSourceFile} export "${langData.phraseSourceExport}" for lang=${language}`);
    }

    const dailyMod = require(`./${language}/dailyLevelsTexts.js`);
    let dailyLevelsTexts = langData.dailySourceExport === 'default'
        ? dailyMod.default
        : dailyMod[langData.dailySourceExport];
    if (!Array.isArray(dailyLevelsTexts)) {
        throw new Error(`Expected array from dailyLevelsTexts.js export "${langData.dailySourceExport}" for lang=${language}`);
    }

    if (deleteAllBefore) {
        allLevels = [];
    }

    const allLevelsTexts = [];
    allLevels.forEach(level => {
        allLevelsTexts.push(level.text);
    });

    console.log('allQuotes.length', allQuotes.length);

    allQuotes = shuffleArray(allQuotes);

    // Apply per-language text validation before accepting a phrase into the pool.
    // We filter here so addWordsToLevelsUntill never sees invalid phrases.
    allQuotes = allQuotes.filter(phrase => {
        let text = phrase.text;
        if (langConfig.normalizeYo) {
            text = text.replace(/ё/gi, 'е');
        }
        if (text.length < langConfig.minLen || text.length > langConfig.maxLen) {
            return false;
        }
        if (langConfig.foreignScriptRegex && langConfig.foreignScriptRegex.test(text)) {
            // Reset lastIndex in case the regex is stateful (global flag).
            langConfig.foreignScriptRegex.lastIndex = 0;
            return false;
        }
        if (langConfig.badWordFilter && testTextForBadWords(text)) {
            return false;
        }
        if (langConfig.excludedNames && langConfig.excludedNames.includes(phrase.name)) {
            return false;
        }
        return true;
    });

    // Apply normalizeYo to the phrase objects so createLevel sees normalised text.
    if (langConfig.normalizeYo) {
        allQuotes = allQuotes.map(phrase => ({
            ...phrase,
            text: phrase.text.replace(/ё/gi, 'е')
        }));
    }

    const notUsedTypes = typesOfCategories.slice();

    // State object threaded through generator helpers to avoid global mutable state.
    const state = {
        allLevels,
        allQuotes,
        notUsedTypes,
        typesOfCategories,
        allLevelsTexts
    };

    if (levelTarget === null) {
        console.log(`No levelTarget configured for ${language}, skipping levels generation`);
    } else {
        console.log('start generate');

        if (allLevels.length === 0) {
            // Ищем маленькие уровни в начале списка
            let allSmallQuotes = [];
            for (let i = 0; i < allQuotes.length; i++) {
                let quote = allQuotes[i];
                if (quote.text.length < 50) {
                    allSmallQuotes.push(quote);
                }
            }
            // Первые 3 уровня малыши
            let level1 = createLevel(allSmallQuotes[0], language, 0, 0.85, allLevelsTexts);
            level1.hiddenIndexes = trimRandom(level1.hiddenIndexes, 4);
            allLevels.push(level1);

            let level2 = createLevel(allSmallQuotes[1], language, 0, 0.8, allLevelsTexts);
            level2.hiddenIndexes = trimRandom(level2.hiddenIndexes, 6);
            allLevels.push(level2);

            let level3 = createLevel(allSmallQuotes[2], language, 1, 0.7, allLevelsTexts);
            level3.hiddenIndexes = trimRandom(level3.hiddenIndexes, 10);
            allLevels.push(level3);

            // 4 уровня
            addWordsToLevelsUntill(4,   30,  50,  1, 0.8,  language, state);
            // 6 уровней
            addWordsToLevelsUntill(6,   30,  70,  1, 0.7,  language, state);
            addWordsToLevelsUntill(8,   50,  85,  1, 0.6,  language, state);
            addWordsToLevelsUntill(10,  60, 100,  2, 0.5,  language, state);
            addWordsToLevelsUntill(12,  70, 120,  2, 0.4,  language, state);
            addWordsToLevelsUntill(15,  70, 140,  3, 0.3,  language, state);
            addWordsToLevelsUntill(20,  50, 150,  3, 0.2,  language, state);
            addWordsToLevelsUntill(25,  50, 180,  3, 0.1,  language, state);
            addWordsToLevelsUntill(500, 40, 250,  3, 0.05, language, state);
        } else {
            addWordsToLevelsUntill(levelTarget, 50, 270, 3, 0.05, language, state);
        }
    }

    console.log(allLevels.length);


    // Daily levels — full rewrite strategy: iterate all entries, build from scratch.
    const newDailyLevels = [];
    for (let i = 0; i < dailyLevelsTexts.length; i++) {
        let text = dailyLevelsTexts[i];
        let level = createLevel({
            text: text,
            name: langData.definitions,
            type: 'science'
        }, language, 3, 0.05, allLevelsTexts);
        if (level !== null) {
            newDailyLevels.push(level);
        }
    }

    // Location levels — RU only.
    let newLocationLevels = [];
    if (language === 'ru') {
        newLocationLevels = await generateRuLocationLevels(allLevelsTexts);
    }

    if (doUpdate) {
        await fsp.writeFile(
            path.join(__dirname, '..', 'src', 'levels', language, 'allLevels.js'),
            `export default [\n${allLevels.map(result => '\n' + JSON.stringify(result))}\n]`
        );

        await fsp.writeFile(
            path.join(__dirname, '..', 'src', 'levels', language, 'dailyLevels.js'),
            `export default [\n${newDailyLevels.map(result => '\n' + JSON.stringify(result))}\n]`
        );

        if (language === 'ru') {
            await fsp.writeFile(
                path.join(__dirname, '..', 'src', 'levels', 'ru', 'locationLevels.js'),
                `export default [\n${newLocationLevels.map(result => '\n' + JSON.stringify(result))}\n]`
            );
        }
    }
}

// Reads locationCitats.js (ESM named export) via fs, strips the export declaration,
// evals the array, then generates levels using the same params as the legacy RU script
// (complexity=3, fullness=0.05 as specified in PLAN.md S3).
async function generateRuLocationLevels(allLevelsTexts) {
    const locationCitatsPath = path.join(__dirname, 'ru', 'locationCitats.js');
    let locationLevels;
    try {
        const src = await fsp.readFile(locationCitatsPath, 'utf8');
        // File uses: export const locationLevels = [...];
        // Strip the ESM export so we can eval the assignment.
        const stripped = src.replace(/^export\s+const\s+/, 'const ');
        // Use Function constructor to avoid polluting the module scope.
        const fn = new Function(stripped + '\nreturn locationLevels;');
        locationLevels = fn();
    } catch (err) {
        console.error('generateRuLocationLevels: failed to load locationCitats.js —', err.message);
        return [];
    }

    if (!Array.isArray(locationLevels)) {
        console.error('generateRuLocationLevels: expected locationLevels to be an array, got', typeof locationLevels);
        return [];
    }

    const shuffled = locationLevels.slice();
    shuffleArray(shuffled);

    const newLocationLevels = [];
    for (const obj of shuffled) {
        if (!obj || typeof obj.text !== 'string' || typeof obj.author !== 'string') {
            continue;
        }
        const level = createLevel(
            { text: obj.text, name: obj.author, type: 'quotes' },
            'ru',
            3,    // complexity — matches legacy ru/createLevel.cjs
            0.05, // fullness  — matches legacy ru/createLevel.cjs
            allLevelsTexts
        );
        if (level !== null) {
            // legacy script always sets desc: '' for location levels
            level.desc = '';
            newLocationLevels.push(level);
        }
    }

    console.log('newLocationLevels.length', newLocationLevels.length);
    return newLocationLevels;
}

if (require.main === module) {
    runCli().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = {
    createLevel: (phrase, lang, complexity, fullness, allLevelsTexts) =>
        createLevel(phrase, lang, complexity, fullness, allLevelsTexts || [])
};
