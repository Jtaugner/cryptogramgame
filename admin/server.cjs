const express = require('express');
const fs = require('fs');
const path = require('path');

const { dataForLanguages } = require('../creatingLevels/dataForLanguages.cjs');
const { configForLanguages } = require('../creatingLevels/configForLanguages.cjs');
const {
  createLevel,
  replaceLongDashes,
  addWordsToLevelsUntill,
  shuffleArray,
  testTextForBadWords,
} = require('../creatingLevels/generator.cjs');

const VALID_LANGUAGES = Object.keys(dataForLanguages);

// ---------------------------------------------------------------------------
// ESM file reader: strips the export declaration, evals the array/object.
// Using fs-based parsing instead of require() to avoid ESM cache issues.
// ---------------------------------------------------------------------------

/**
 * Read an ESM file that exports a named const or default export.
 * Returns the exported value.
 *
 * Handles two shapes:
 *   export const <name> = [...];
 *   export default [...];
 */
async function readEsmFile(absPath) {
  const src = await fs.promises.readFile(absPath, 'utf8');
  // Replace `export const NAME =` with `result =` (we don't need the name)
  // or `export default` with `result =`
  const stripped = src
    .replace(/^export\s+const\s+\w+\s*=\s*/, 'result = ')
    .replace(/^export\s+default\s+/, 'result = ');
  // Wrap in a function that returns the result variable
  const fn = new Function('let result; ' + stripped + '; return result;');
  return fn();
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function getDataForLanguage(lang) {
  if (!lang || !VALID_LANGUAGES.includes(lang)) {
    const err = new Error(`Invalid or missing language: "${lang}". Valid: ${VALID_LANGUAGES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
  return dataForLanguages[lang];
}

async function loadSourceQuotes(lang) {
  const langData = getDataForLanguage(lang);
  const absPath = path.join(__dirname, '..', 'creatingLevels', lang, langData.phraseSourceFile);
  const data = await readEsmFile(absPath);
  if (!Array.isArray(data)) {
    throw new Error(`Expected array from ${langData.phraseSourceFile} for lang=${lang}`);
  }
  return data;
}

/**
 * Serialize quotes array to the source ESM format:
 *
 *   export const <exportName> = [
 *     {"text":"...","name":"...","desc":"...","type":"..."},
 *     ...
 *   ];
 *
 * Keys are emitted in the fixed order: text, name, desc, type.
 * Trailing comma on every entry except the last.
 */
async function saveSourceQuotes(lang, quotes) {
  const langData = getDataForLanguage(lang);
  const absPath = path.join(__dirname, '..', 'creatingLevels', lang, langData.phraseSourceFile);

  const lines = quotes.map((q, i) => {
    const entry = { text: q.text, name: q.name };
    if (typeof q.desc === 'string' && q.desc.trim() !== '') entry.desc = q.desc;
    entry.type = q.type;
    const comma = i < quotes.length - 1 ? ',' : '';
    return `  ${JSON.stringify(entry)}${comma}`;
  });

  const content = `export const ${langData.phraseSourceExport} = [\n${lines.join('\n')}\n];\n`;
  await fs.promises.writeFile(absPath, content, 'utf8');
}

async function loadAllLevels(lang) {
  // Validate lang (getDataForLanguage throws with statusCode 400 on bad lang)
  getDataForLanguage(lang);
  const absPath = path.join(__dirname, '..', 'src', 'levels', lang, 'allLevels.js');
  const data = await readEsmFile(absPath);
  if (!Array.isArray(data)) {
    throw new Error(`Expected array from allLevels.js for lang=${lang}`);
  }
  return data;
}

/**
 * Serialize allLevels to the same template used by createLevel.cjs:
 *   export default [\n${items.map(x => '\n' + JSON.stringify(x))}\n]
 */
async function saveAllLevels(lang, allLevels) {
  const absPath = path.join(__dirname, '..', 'src', 'levels', lang, 'allLevels.js');
  const content = `export default [\n${allLevels.map(x => '\n' + JSON.stringify(x))}\n]`;
  await fs.promises.writeFile(absPath, content, 'utf8');
}

/**
 * Generate a level entry from a phrase object.
 * Returns {text, hiddenIndexes, name, desc, type} or null if generator fails.
 */
function regenerateLevel(lang, phrase, allLevelsTexts) {
  // Mirror legacy createLevel.cjs runCli: apply ё→е before generating, so the
  // stored allLevels entry uses the same normalized text as legacy-produced ones.
  // Without this, subsequent GETs would miss the entry on findIndex by normalized text.
  const langConfig = configForLanguages[lang];
  const normalizedPhrase = langConfig && langConfig.normalizeYo
    ? { ...phrase, text: phrase.text.replace(/ё/gi, 'е') }
    : phrase;
  const result = createLevel(normalizedPhrase, lang, 3, 0.05, allLevelsTexts);
  if (result === null) return null;
  // createLevel doesn't copy desc — do it here
  if (typeof phrase.desc === 'string' && phrase.desc.trim() !== '') {
    result.desc = phrase.desc;
  }
  return result;
}

/**
 * Normalize a phrase text the same way createLevel does:
 * ё→е (for ru), replace long dashes, trim, add trailing period if last char is a letter.
 * Order mirrors the legacy generator's runCli preprocessing in createLevel.cjs.
 */
function normalizeText(text, lang) {
  const langData = dataForLanguages[lang];
  const langConfig = configForLanguages[lang];
  let t = text;
  if (langConfig && langConfig.normalizeYo) {
    t = t.replace(/ё/gi, 'е');
  }
  t = replaceLongDashes(t);
  t = t.trim();
  if (langData.isLetterRegex.test(t[t.length - 1])) {
    t += '.';
  }
  return t;
}

// ---------------------------------------------------------------------------
// Daily helpers
// ---------------------------------------------------------------------------

async function loadDailySource(lang) {
  const langData = getDataForLanguage(lang);
  const absPath = path.join(__dirname, '..', 'creatingLevels', lang, 'dailyLevelsTexts.js');
  const data = await readEsmFile(absPath);
  if (!Array.isArray(data)) {
    throw new Error(`Expected array from dailyLevelsTexts.js for lang=${lang}`);
  }
  return data;
}

async function saveDailySource(lang, strings) {
  const langData = getDataForLanguage(lang);
  const absPath = path.join(__dirname, '..', 'creatingLevels', lang, 'dailyLevelsTexts.js');

  const lines = strings.map((s, i) => {
    const comma = i < strings.length - 1 ? ',' : '';
    return `     ${JSON.stringify(s)}${comma}`;
  });

  let content;
  if (langData.dailySourceExport === 'default') {
    content = `export default [\n${lines.join('\n')}\n]\n`;
  } else {
    content = `export const ${langData.dailySourceExport} = [\n${lines.join('\n')}\n]\n`;
  }
  await fs.promises.writeFile(absPath, content, 'utf8');
}

async function loadDailyTarget(lang) {
  getDataForLanguage(lang);
  const absPath = path.join(__dirname, '..', 'src', 'levels', lang, 'dailyLevels.js');
  const data = await readEsmFile(absPath);
  if (!Array.isArray(data)) {
    throw new Error(`Expected array from dailyLevels.js for lang=${lang}`);
  }
  return data;
}

async function saveDailyTarget(lang, levels) {
  const absPath = path.join(__dirname, '..', 'src', 'levels', lang, 'dailyLevels.js');
  const content = `export default [\n${levels.map(x => '\n' + JSON.stringify(x))}\n]`;
  await fs.promises.writeFile(absPath, content, 'utf8');
}

/**
 * Regenerate a daily level entry — synthesizes name/desc/type from language config.
 */
function regenerateDailyLevel(lang, text, allDailyTexts) {
  const langData = dataForLanguages[lang];
  return regenerateLevel(
    lang,
    { text, name: langData.definitions, desc: '', type: 'science' },
    allDailyTexts,
  );
}

// ---------------------------------------------------------------------------
// Location helpers — reads/writes src/levels/{lang}/locationLevels.js
// ---------------------------------------------------------------------------

/**
 * Load the bucketed location levels object from src/levels/{lang}/locationLevels.js.
 * Returns {} if the file is missing or exports an empty object.
 */
async function loadLocationLevels(lang) {
  getDataForLanguage(lang);
  const absPath = path.join(__dirname, '..', 'src', 'levels', lang, 'locationLevels.js');
  try {
    const data = await readEsmFile(absPath);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return data;
  } catch (_e) {
    return {};
  }
}

/**
 * Write the bucketed location levels object back to src/levels/{lang}/locationLevels.js.
 * Format: 2-space indent, one JSON entry per line, no trailing comma after last bucket.
 */
async function saveLocationLevels(lang, obj) {
  getDataForLanguage(lang);
  const absPath = path.join(__dirname, '..', 'src', 'levels', lang, 'locationLevels.js');
  const keys = Object.keys(obj);
  const blocks = keys.map((k, i) => {
    const arr = obj[k];
    const lines = arr.map(x => '  ' + JSON.stringify(x)).join(',\n');
    const sep = i < keys.length - 1 ? ',' : '';
    return `  ${JSON.stringify(k)}: [\n${lines}\n  ]${sep}`;
  });
  const content = `export default {\n${blocks.join('\n')}\n}\n`;
  await fs.promises.writeFile(absPath, content, 'utf8');
}

/**
 * Return the most-common `name` value in a bucket array.
 * Ties broken by first occurrence.
 */
function topNameInBucket(arr) {
  const counts = new Map();
  const order = [];
  for (const entry of arr) {
    const n = entry.name || '';
    if (!counts.has(n)) {
      counts.set(n, 0);
      order.push(n);
    }
    counts.set(n, counts.get(n) + 1);
  }
  let best = order[0] ?? '';
  let bestCount = 0;
  for (const n of order) {
    const c = counts.get(n);
    if (c > bestCount) {
      bestCount = c;
      best = n;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

async function main() {
  const app = express();
  app.use(express.json());

  // ---------------------------------------------------------------------------
  // GET /api/health
  // ---------------------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  // ---------------------------------------------------------------------------
  // GET /api/languages
  // ---------------------------------------------------------------------------
  app.get('/api/languages', (req, res) => {
    res.json({ languages: VALID_LANGUAGES });
  });

  // ---------------------------------------------------------------------------
  // GET /api/locations?lang=
  // Returns month-bucket descriptors from src/levels/{lang}/locationLevels.js.
  // Works for any lang; returns empty array when file has no buckets.
  // ---------------------------------------------------------------------------
  app.get('/api/locations', async (req, res, next) => {
    try {
      const { lang } = req.query;
      getDataForLanguage(lang); // validate lang

      const obj = await loadLocationLevels(lang);
      const keys = Object.keys(obj).sort();

      if (keys.length === 0) {
        return res.json({ lang, locations: [] });
      }

      // Translations live in src/locales/locations.json keyed by `location{YYYY-MM}`.
      // Prefer current lang's translation; fall back to ru, then any non-empty value.
      const translations = await loadLocationsTranslations().catch(() => ({}));
      const pickTranslation = (k) => {
        const entry = translations[`location${k}`];
        if (!entry || typeof entry !== 'object') return '';
        if (typeof entry[lang] === 'string' && entry[lang].trim()) return entry[lang];
        if (typeof entry.ru === 'string' && entry.ru.trim()) return entry.ru;
        for (const v of Object.values(entry)) {
          if (typeof v === 'string' && v.trim()) return v;
        }
        return '';
      };

      const locations = keys.map(k => {
        const arr = obj[k];
        const count = Array.isArray(arr) ? arr.length : 0;
        const translatedName = pickTranslation(k);
        const label = translatedName ? `${k} (${translatedName})` : k;
        return { key: k, label, count };
      });

      return res.json({ lang, locations });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // GET /api/quotes?lang=ru&mode=source|levels|daily|locations&search=&type=&page=&pageSize=&location=
  // Default mode: levels
  // ---------------------------------------------------------------------------
  app.get('/api/quotes', async (req, res, next) => {
    try {
      const { lang, search = '', type = '', location = '' } = req.query;
      const page = parseInt(req.query.page, 10) || 0;
      const pageSize = parseInt(req.query.pageSize, 10) || 50;
      const mode = req.query.mode || 'levels';
      // sort only applies to levels mode; anything other than 'desc' is treated as 'asc'
      const sort = req.query.sort === 'desc' ? 'desc' : 'asc';

      const langData = getDataForLanguage(lang);

      if (mode === 'levels') {
        // --- Levels mode ---
        // Load both allLevels and source so we can resolve indexInFile for each level entry
        const [allLevels, sourceQuotes] = await Promise.all([
          loadAllLevels(lang),
          loadSourceQuotes(lang),
        ]);

        // Build normalized-text → first indexInFile map from source quotes
        const normToSourceIdx = new Map();
        for (let i = 0; i < sourceQuotes.length; i++) {
          const norm = normalizeText(sourceQuotes[i].text, lang);
          if (!normToSourceIdx.has(norm)) {
            normToSourceIdx.set(norm, i);
          }
        }

        // Build candidate list preserving allLevels order
        const searchLower = search ? search.toLowerCase() : '';
        const candidates = [];
        for (let i = 0; i < allLevels.length; i++) {
          const level = allLevels[i];
          if (searchLower && !level.text.toLowerCase().includes(searchLower)) continue;
          if (type && level.type !== type) continue;
          // Resolve indexInFile: try exact text, then normalized
          const norm = normalizeText(level.text, lang);
          const indexInFile = normToSourceIdx.has(level.text)
            ? normToSourceIdx.get(level.text)
            : (normToSourceIdx.has(norm) ? normToSourceIdx.get(norm) : null);
          candidates.push({
            levelIndex: i,
            indexInFile: indexInFile,
            text: level.text,
            name: level.name,
            desc: level.desc !== undefined ? level.desc : '',
            type: level.type,
          });
        }

        if (sort === 'desc') {
          candidates.reverse();
        }

        const start = page * pageSize;
        const items = candidates.slice(start, start + pageSize);

        return res.json({
          lang,
          sourceFile: langData.phraseSourceFile,
          mode: 'levels',
          total: allLevels.length,
          filtered: candidates.length,
          page,
          pageSize,
          sort,
          items,
        });
      }

      if (mode === 'daily') {
        // --- Daily mode ---
        const strings = await loadDailySource(lang);
        const searchLower = search ? search.toLowerCase() : '';
        const candidates = [];
        for (let i = 0; i < strings.length; i++) {
          const text = strings[i];
          if (searchLower && !text.toLowerCase().includes(searchLower)) continue;
          // type filter is ignored in daily mode (type is always synthesized)
          candidates.push({
            indexInFile: i,
            levelIndex: null,
            text,
            name: langData.definitions,
            desc: '',
            type: 'science',
          });
        }

        const start = page * pageSize;
        const items = candidates.slice(start, start + pageSize);

        return res.json({
          lang,
          sourceFile: 'dailyLevelsTexts.js',
          mode: 'daily',
          total: strings.length,
          filtered: candidates.length,
          page,
          pageSize,
          items,
        });
      }

      if (mode === 'locations') {
        // --- Locations mode: reads from src/levels/{lang}/locationLevels.js ---
        if (!location) {
          return res.status(400).json({ error: 'Query param "location" (bucket key) is required in locations mode.' });
        }

        const obj = await loadLocationLevels(lang);
        const bucket = obj[location];
        if (!bucket) {
          return res.status(400).json({ error: `Unknown location bucket: "${location}". Fetch /api/locations?lang=${lang} for valid keys.` });
        }

        const searchLower = search ? search.toLowerCase() : '';
        const candidates = [];
        for (let i = 0; i < bucket.length; i++) {
          const e = bucket[i];
          if (searchLower && !e.text.toLowerCase().includes(searchLower)) continue;
          candidates.push({
            indexInFile: i,
            levelIndex: null,
            location,
            text: e.text,
            name: e.name,
            desc: e.desc !== undefined ? e.desc : '',
            type: e.type,
          });
        }

        const start = page * pageSize;
        const items = candidates.slice(start, start + pageSize);

        return res.json({
          lang,
          sourceFile: 'locationLevels.js',
          mode: 'locations',
          total: bucket.length,
          filtered: candidates.length,
          page,
          pageSize,
          items,
        });
      }

      // --- Source mode (default fallback) ---
      const quotes = await loadSourceQuotes(lang);

      // Build filtered list with original indexes preserved
      const searchLower = search ? search.toLowerCase() : '';
      const filtered = [];
      for (let i = 0; i < quotes.length; i++) {
        const q = quotes[i];
        if (searchLower && !q.text.toLowerCase().includes(searchLower)) continue;
        if (type && q.type !== type) continue;
        filtered.push({ levelIndex: null, indexInFile: i, ...q });
      }

      const start = page * pageSize;
      const items = filtered.slice(start, start + pageSize);

      res.json({
        lang,
        sourceFile: langData.phraseSourceFile,
        mode: 'source',
        total: quotes.length,
        filtered: filtered.length,
        page,
        pageSize,
        items,
      });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // GET /api/quote/:lang/:source/:index
  // ---------------------------------------------------------------------------
  app.get('/api/quote/:lang/:source/:index', async (req, res, next) => {
    try {
      const { lang, source, index: indexStr } = req.params;
      const langData = getDataForLanguage(lang);

      if (source !== langData.phraseSourceFile) {
        return res.status(400).json({ error: `Source file mismatch. Expected "${langData.phraseSourceFile}" for lang="${lang}".` });
      }

      const index = parseInt(indexStr, 10);
      if (!Number.isInteger(index) || index < 0) {
        return res.status(400).json({ error: 'Index must be a non-negative integer.' });
      }

      const quotes = await loadSourceQuotes(lang);
      if (index >= quotes.length) {
        return res.status(404).json({ error: `Index ${index} out of range (0–${quotes.length - 1}).` });
      }

      const quote = quotes[index];
      const allLevels = await loadAllLevels(lang);

      // Find matching entry in allLevels by raw text comparison
      const match = allLevels.find(entry => entry.text === quote.text);
      // Also try normalized text match as fallback
      let hiddenIndexes = null;
      let matchedInAllLevels = false;
      if (match) {
        hiddenIndexes = match.hiddenIndexes;
        matchedInAllLevels = true;
      } else {
        const normalizedText = normalizeText(quote.text, lang);
        const normalizedMatch = allLevels.find(entry => entry.text === normalizedText);
        if (normalizedMatch) {
          hiddenIndexes = normalizedMatch.hiddenIndexes;
          matchedInAllLevels = true;
        }
      }

      res.json({
        lang,
        source,
        index,
        text: quote.text,
        name: quote.name,
        desc: quote.desc !== undefined ? quote.desc : '',
        type: quote.type,
        hiddenIndexes,
        matchedInAllLevels,
      });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // PUT /api/quote/:lang/:source/:index
  // ---------------------------------------------------------------------------
  app.put('/api/quote/:lang/:source/:index', async (req, res, next) => {
    try {
      const { lang, source, index: indexStr } = req.params;
      const langData = getDataForLanguage(lang);

      if (source !== langData.phraseSourceFile) {
        return res.status(400).json({ error: `Source file mismatch. Expected "${langData.phraseSourceFile}" for lang="${lang}".` });
      }

      const index = parseInt(indexStr, 10);
      if (!Number.isInteger(index) || index < 0) {
        return res.status(400).json({ error: 'Index must be a non-negative integer.' });
      }

      const { text, name, desc, type } = req.body || {};
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Body field "text" is required and must be a non-empty string.' });
      }
      if (typeof name !== 'string') {
        return res.status(400).json({ error: 'Body field "name" is required and must be a string.' });
      }
      if (desc !== undefined && typeof desc !== 'string') {
        return res.status(400).json({ error: 'Body field "desc" must be a string when provided.' });
      }
      if (typeof type !== 'string') {
        return res.status(400).json({ error: 'Body field "type" is required and must be a string.' });
      }

      const quotes = await loadSourceQuotes(lang);
      if (index >= quotes.length) {
        return res.status(404).json({ error: `Index ${index} out of range (0–${quotes.length - 1}).` });
      }

      const oldText = quotes[index].text;
      const oldNormalized = normalizeText(oldText, lang);

      // Update source entry (only the four canonical fields)
      quotes[index] = { text, name, desc, type };

      const allLevels = await loadAllLevels(lang);

      // Build allLevelsTexts excluding the old entry so generator doesn't treat it as duplicate
      const allLevelsTexts = allLevels
        .filter(l => l.text !== oldNormalized)
        .map(l => l.text);

      const regenerated = regenerateLevel(lang, { text, name, desc, type }, allLevelsTexts);
      if (regenerated === null) {
        return res.status(422).json({ error: 'Generator returned null — phrase may be too short or unsuited.' });
      }

      // Replace in allLevels only if the old quote was already a level.
      // If it wasn't, don't add it — PUT only updates source in that case.
      // Use POST to create a new level from a non-level quote.
      const matchIdx = allLevels.findIndex(entry => entry.text === oldNormalized);
      let matchedInAllLevels = false;
      if (matchIdx !== -1) {
        allLevels[matchIdx] = regenerated;
        matchedInAllLevels = true;
      }

      await saveSourceQuotes(lang, quotes);
      await saveAllLevels(lang, allLevels);

      res.json({
        ok: true,
        lang,
        source,
        index,
        regenerated,
        matchedInAllLevels,
      });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // POST /api/quote/:lang
  // ---------------------------------------------------------------------------
  app.post('/api/quote/:lang', async (req, res, next) => {
    try {
      const { lang } = req.params;
      getDataForLanguage(lang);

      const { text, name, desc, type } = req.body || {};
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Body field "text" is required and must be a non-empty string.' });
      }
      if (typeof name !== 'string') {
        return res.status(400).json({ error: 'Body field "name" is required and must be a string.' });
      }
      if (desc !== undefined && typeof desc !== 'string') {
        return res.status(400).json({ error: 'Body field "desc" must be a string when provided.' });
      }
      if (typeof type !== 'string') {
        return res.status(400).json({ error: 'Body field "type" is required and must be a string.' });
      }

      const quotes = await loadSourceQuotes(lang);
      quotes.push({ text, name, desc, type });
      const newIndex = quotes.length - 1;

      const allLevels = await loadAllLevels(lang);
      const allLevelsTexts = allLevels.map(l => l.text);

      const regenerated = regenerateLevel(lang, { text, name, desc, type }, allLevelsTexts);
      if (regenerated === null) {
        return res.status(422).json({ error: 'Generator returned null — phrase may be too short or unsuited.' });
      }

      allLevels.push(regenerated);

      await saveSourceQuotes(lang, quotes);
      await saveAllLevels(lang, allLevels);

      const langData = dataForLanguages[lang];
      res.json({
        ok: true,
        lang,
        source: langData.phraseSourceFile,
        index: newIndex,
        regenerated,
      });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/quote/:lang/:source/:index
  // ---------------------------------------------------------------------------
  app.delete('/api/quote/:lang/:source/:index', async (req, res, next) => {
    try {
      const { lang, source, index: indexStr } = req.params;
      const langData = getDataForLanguage(lang);

      if (source !== langData.phraseSourceFile) {
        return res.status(400).json({ error: `Source file mismatch. Expected "${langData.phraseSourceFile}" for lang="${lang}".` });
      }

      const index = parseInt(indexStr, 10);
      if (!Number.isInteger(index) || index < 0) {
        return res.status(400).json({ error: 'Index must be a non-negative integer.' });
      }

      const quotes = await loadSourceQuotes(lang);
      if (index >= quotes.length) {
        return res.status(404).json({ error: `Index ${index} out of range (0–${quotes.length - 1}).` });
      }

      const oldText = quotes[index].text;
      const oldNormalized = normalizeText(oldText, lang);

      quotes.splice(index, 1);

      const allLevels = await loadAllLevels(lang);
      const matchIdx = allLevels.findIndex(entry => entry.text === oldNormalized);
      let matchedInAllLevels = false;
      if (matchIdx !== -1) {
        allLevels.splice(matchIdx, 1);
        matchedInAllLevels = true;
      }

      await saveSourceQuotes(lang, quotes);
      await saveAllLevels(lang, allLevels);

      res.json({ ok: true, lang, source, index, matchedInAllLevels });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // GET /api/daily/:lang/:index
  // ---------------------------------------------------------------------------
  app.get('/api/daily/:lang/:index', async (req, res, next) => {
    try {
      const { lang, index: indexStr } = req.params;
      const langData = getDataForLanguage(lang);

      const index = parseInt(indexStr, 10);
      if (!Number.isInteger(index) || index < 0) {
        return res.status(400).json({ error: 'Index must be a non-negative integer.' });
      }

      const strings = await loadDailySource(lang);
      if (index >= strings.length) {
        return res.status(404).json({ error: `Index ${index} out of range (0–${strings.length - 1}).` });
      }

      const text = strings[index];
      const target = await loadDailyTarget(lang);
      const normalizedText = normalizeText(text, lang);

      const match = target.find(e => e.text === text || e.text === normalizedText);
      const hiddenIndexes = match ? match.hiddenIndexes : null;
      const matchedInTarget = match !== undefined;

      return res.json({
        lang,
        index,
        text,
        name: langData.definitions,
        desc: '',
        type: 'science',
        hiddenIndexes,
        matchedInTarget,
      });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // PUT /api/daily/:lang/:index
  // ---------------------------------------------------------------------------
  app.put('/api/daily/:lang/:index', async (req, res, next) => {
    try {
      const { lang, index: indexStr } = req.params;
      getDataForLanguage(lang);

      const index = parseInt(indexStr, 10);
      if (!Number.isInteger(index) || index < 0) {
        return res.status(400).json({ error: 'Index must be a non-negative integer.' });
      }

      const { text } = req.body || {};
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Body field "text" is required and must be a non-empty string.' });
      }

      const strings = await loadDailySource(lang);
      if (index >= strings.length) {
        return res.status(404).json({ error: `Index ${index} out of range (0–${strings.length - 1}).` });
      }

      const oldText = strings[index];
      const oldNormalized = normalizeText(oldText, lang);

      strings[index] = text;

      const target = await loadDailyTarget(lang);
      // Exclude old entry so generator doesn't see it as a duplicate
      const allDailyTexts = target.filter(e => e.text !== oldNormalized).map(e => e.text);
      const regenerated = regenerateDailyLevel(lang, text, allDailyTexts);
      if (regenerated === null) {
        return res.status(422).json({ error: 'Generator returned null — phrase may be too short or unsuited.' });
      }

      const matchIdx = target.findIndex(e => e.text === oldNormalized);
      let matchedInTarget = false;
      if (matchIdx !== -1) {
        target[matchIdx] = regenerated;
        matchedInTarget = true;
      }

      await saveDailySource(lang, strings);
      await saveDailyTarget(lang, target);

      return res.json({ ok: true, lang, index, regenerated, matchedInTarget });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // POST /api/daily/:lang
  // ---------------------------------------------------------------------------
  app.post('/api/daily/:lang', async (req, res, next) => {
    try {
      const { lang } = req.params;
      getDataForLanguage(lang);

      const { text } = req.body || {};
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Body field "text" is required and must be a non-empty string.' });
      }

      const strings = await loadDailySource(lang);
      strings.push(text);
      const newIndex = strings.length - 1;

      const target = await loadDailyTarget(lang);
      const allDailyTexts = target.map(e => e.text);
      const regenerated = regenerateDailyLevel(lang, text, allDailyTexts);
      if (regenerated === null) {
        return res.status(422).json({ error: 'Generator returned null — phrase may be too short or unsuited.' });
      }

      target.push(regenerated);

      await saveDailySource(lang, strings);
      await saveDailyTarget(lang, target);

      return res.json({ ok: true, lang, index: newIndex, regenerated });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/daily/:lang/:index
  // ---------------------------------------------------------------------------
  app.delete('/api/daily/:lang/:index', async (req, res, next) => {
    try {
      const { lang, index: indexStr } = req.params;
      getDataForLanguage(lang);

      const index = parseInt(indexStr, 10);
      if (!Number.isInteger(index) || index < 0) {
        return res.status(400).json({ error: 'Index must be a non-negative integer.' });
      }

      const strings = await loadDailySource(lang);
      if (index >= strings.length) {
        return res.status(404).json({ error: `Index ${index} out of range (0–${strings.length - 1}).` });
      }

      const oldText = strings[index];
      const oldNormalized = normalizeText(oldText, lang);
      strings.splice(index, 1);

      const target = await loadDailyTarget(lang);
      const matchIdx = target.findIndex(e => e.text === oldNormalized);
      let matchedInTarget = false;
      if (matchIdx !== -1) {
        target.splice(matchIdx, 1);
        matchedInTarget = true;
      }

      await saveDailySource(lang, strings);
      await saveDailyTarget(lang, target);

      return res.json({ ok: true, lang, index, matchedInTarget });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // GET /api/location/:lang/:key/:index
  // ---------------------------------------------------------------------------
  app.get('/api/location/:lang/:key/:index', async (req, res, next) => {
    try {
      const { lang, key, index: indexStr } = req.params;
      getDataForLanguage(lang);

      const index = parseInt(indexStr, 10);
      if (!Number.isInteger(index) || index < 0) {
        return res.status(400).json({ error: 'Index must be a non-negative integer.' });
      }

      const obj = await loadLocationLevels(lang);
      const bucket = obj[key];
      if (!bucket) {
        return res.status(404).json({ error: `Bucket "${key}" not found.` });
      }
      if (index >= bucket.length) {
        return res.status(404).json({ error: `Index ${index} out of range (0–${bucket.length - 1}).` });
      }

      const e = bucket[index];
      return res.json({
        lang,
        location: key,
        index,
        text: e.text,
        name: e.name,
        desc: e.desc !== undefined ? e.desc : '',
        type: e.type,
        hiddenIndexes: e.hiddenIndexes || null,
      });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // PUT /api/location/:lang/:key/:index  body: {text, name, desc, type}
  // Regenerates hiddenIndexes and writes back to locationLevels.js
  // ---------------------------------------------------------------------------
  app.put('/api/location/:lang/:key/:index', async (req, res, next) => {
    try {
      const { lang, key, index: indexStr } = req.params;
      getDataForLanguage(lang);

      const index = parseInt(indexStr, 10);
      if (!Number.isInteger(index) || index < 0) {
        return res.status(400).json({ error: 'Index must be a non-negative integer.' });
      }

      const { text, name, desc, type } = req.body || {};
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Body field "text" is required and must be a non-empty string.' });
      }
      if (typeof name !== 'string') {
        return res.status(400).json({ error: 'Body field "name" is required and must be a string.' });
      }
      if (desc !== undefined && typeof desc !== 'string') {
        return res.status(400).json({ error: 'Body field "desc" must be a string when provided.' });
      }
      if (typeof type !== 'string') {
        return res.status(400).json({ error: 'Body field "type" is required and must be a string.' });
      }

      const obj = await loadLocationLevels(lang);
      const bucket = obj[key];
      if (!bucket) {
        return res.status(400).json({ error: `Bucket "${key}" not found.` });
      }
      if (index >= bucket.length) {
        return res.status(404).json({ error: `Index ${index} out of range (0–${bucket.length - 1}).` });
      }

      // Exclude the entry being replaced so generator doesn't see it as a duplicate
      const allLevelsTexts = bucket.filter((_, i) => i !== index).map(e => e.text);

      const regenerated = regenerateLevel(lang, { text, name, desc, type }, allLevelsTexts);
      if (regenerated === null) {
        return res.status(422).json({ error: 'Generator returned null — phrase may be too short or unsuited.' });
      }

      bucket[index] = regenerated;
      await saveLocationLevels(lang, obj);

      return res.json({ ok: true, lang, location: key, index, regenerated });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // POST /api/location/:lang/:key  body: {text, name, desc, type}
  // Append to existing bucket (creating new buckets is out of scope)
  // ---------------------------------------------------------------------------
  app.post('/api/location/:lang/:key', async (req, res, next) => {
    try {
      const { lang, key } = req.params;
      getDataForLanguage(lang);

      const { text, name, desc, type } = req.body || {};
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Body field "text" is required and must be a non-empty string.' });
      }
      if (typeof name !== 'string') {
        return res.status(400).json({ error: 'Body field "name" is required and must be a string.' });
      }
      if (desc !== undefined && typeof desc !== 'string') {
        return res.status(400).json({ error: 'Body field "desc" must be a string when provided.' });
      }
      if (typeof type !== 'string') {
        return res.status(400).json({ error: 'Body field "type" is required and must be a string.' });
      }

      const obj = await loadLocationLevels(lang);
      const bucket = obj[key];
      if (!bucket) {
        return res.status(400).json({ error: `Bucket "${key}" not found. Creating new buckets is not supported via the API.` });
      }

      const allLevelsTexts = bucket.map(e => e.text);
      const regenerated = regenerateLevel(lang, { text, name, desc, type }, allLevelsTexts);
      if (regenerated === null) {
        return res.status(422).json({ error: 'Generator returned null — phrase may be too short or unsuited.' });
      }

      bucket.push(regenerated);
      const newIndex = bucket.length - 1;
      await saveLocationLevels(lang, obj);

      return res.json({ ok: true, lang, location: key, index: newIndex, regenerated });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/location/:lang/:key/:index
  // ---------------------------------------------------------------------------
  app.delete('/api/location/:lang/:key/:index', async (req, res, next) => {
    try {
      const { lang, key, index: indexStr } = req.params;
      getDataForLanguage(lang);

      const index = parseInt(indexStr, 10);
      if (!Number.isInteger(index) || index < 0) {
        return res.status(400).json({ error: 'Index must be a non-negative integer.' });
      }

      const obj = await loadLocationLevels(lang);
      const bucket = obj[key];
      if (!bucket) {
        return res.status(404).json({ error: `Bucket "${key}" not found.` });
      }
      if (index >= bucket.length) {
        return res.status(404).json({ error: `Index ${index} out of range (0–${bucket.length - 1}).` });
      }

      bucket.splice(index, 1);
      await saveLocationLevels(lang, obj);

      return res.json({ ok: true, lang, location: key, index });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // Names helpers
  // ---------------------------------------------------------------------------

  async function loadAllNames(lang) {
    getDataForLanguage(lang);
    const absPath = path.join(__dirname, '..', 'src', 'levels', lang, 'allNames.js');
    const data = await readEsmFile(absPath);
    if (typeof data !== 'object' || Array.isArray(data) || data === null) {
      throw new Error(`Expected object from allNames.js for lang=${lang}`);
    }
    return data;
  }

  async function saveAllNames(lang, obj) {
    const absPath = path.join(__dirname, '..', 'src', 'levels', lang, 'allNames.js');
    const entries = Object.entries(obj);
    const lines = entries.map(([k, v], i) => {
      const comma = i < entries.length - 1 ? ',' : '';
      return `  ${JSON.stringify(k)}: ${JSON.stringify(v)}${comma}`;
    });
    const content = `export default {\n${lines.join('\n')}\n};\n`;
    await fs.promises.writeFile(absPath, content, 'utf8');
  }

  // ---------------------------------------------------------------------------
  // GET /api/names?lang=&search=&page=&pageSize=
  // ---------------------------------------------------------------------------
  app.get('/api/names', async (req, res, next) => {
    try {
      const { lang, search = '' } = req.query;
      const page = parseInt(req.query.page, 10) || 0;
      const pageSize = parseInt(req.query.pageSize, 10) || 50;

      getDataForLanguage(lang);

      const obj = await loadAllNames(lang);
      const searchLower = search ? search.toLowerCase() : '';
      const candidates = [];
      for (const [name, desc] of Object.entries(obj)) {
        if (searchLower) {
          const nameMatch = name.toLowerCase().includes(searchLower);
          const descMatch = typeof desc === 'string' && desc.toLowerCase().includes(searchLower);
          if (!nameMatch && !descMatch) continue;
        }
        candidates.push({ name, desc: typeof desc === 'string' ? desc : '' });
      }

      const start = page * pageSize;
      const items = candidates.slice(start, start + pageSize);

      return res.json({
        lang,
        mode: 'names',
        total: Object.keys(obj).length,
        filtered: candidates.length,
        page,
        pageSize,
        items,
      });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // GET /api/name/:lang/:name
  // ---------------------------------------------------------------------------
  app.get('/api/name/:lang/:name', async (req, res, next) => {
    try {
      const { lang, name } = req.params;
      getDataForLanguage(lang);

      const obj = await loadAllNames(lang);
      if (!Object.prototype.hasOwnProperty.call(obj, name)) {
        return res.status(404).json({ error: `Name not found: "${name}"` });
      }

      return res.json({ lang, name, desc: typeof obj[name] === 'string' ? obj[name] : '' });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // PUT /api/name/:lang/:name   body: { desc: string }
  // ---------------------------------------------------------------------------
  app.put('/api/name/:lang/:name', async (req, res, next) => {
    try {
      const { lang, name } = req.params;
      getDataForLanguage(lang);

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name must be a non-empty string.' });
      }

      const { desc } = req.body || {};
      if (typeof desc !== 'string') {
        return res.status(400).json({ error: 'Body field "desc" must be a string.' });
      }

      const obj = await loadAllNames(lang);
      if (!Object.prototype.hasOwnProperty.call(obj, name)) {
        return res.status(404).json({ error: `Name not found: "${name}"` });
      }

      obj[name] = desc;
      await saveAllNames(lang, obj);

      return res.json({ ok: true, lang, name, desc });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // POST /api/name/:lang   body: { name: string, desc: string }
  // ---------------------------------------------------------------------------
  app.post('/api/name/:lang', async (req, res, next) => {
    try {
      const { lang } = req.params;
      getDataForLanguage(lang);

      const { name, desc } = req.body || {};
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Body field "name" must be a non-empty string.' });
      }
      if (typeof desc !== 'string') {
        return res.status(400).json({ error: 'Body field "desc" must be a string.' });
      }

      const obj = await loadAllNames(lang);
      if (Object.prototype.hasOwnProperty.call(obj, name)) {
        return res.status(409).json({ error: `Name already exists: "${name}"` });
      }

      obj[name] = desc;
      await saveAllNames(lang, obj);

      return res.json({ ok: true, lang, name, desc });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/name/:lang/:name
  // ---------------------------------------------------------------------------
  app.delete('/api/name/:lang/:name', async (req, res, next) => {
    try {
      const { lang, name } = req.params;
      getDataForLanguage(lang);

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name must be a non-empty string.' });
      }

      const obj = await loadAllNames(lang);
      if (!Object.prototype.hasOwnProperty.call(obj, name)) {
        return res.status(404).json({ error: `Name not found: "${name}"` });
      }

      delete obj[name];
      await saveAllNames(lang, obj);

      return res.json({ ok: true, lang, name });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // GET /api/search?lang=&q=&page=&pageSize=
  // Global cross-mode search. q is required and non-empty (else 400).
  // Results aggregated in order: levels, daily, locations (ru only), source, names.
  // ---------------------------------------------------------------------------
  app.get('/api/search', async (req, res, next) => {
    try {
      const { lang, q } = req.query;
      const page = parseInt(req.query.page, 10) || 0;
      const rawPageSize = parseInt(req.query.pageSize, 10) || 100;
      const pageSize = Math.min(rawPageSize, 500);

      // q is required and must be non-empty
      if (!q || typeof q !== 'string' || !q.trim()) {
        return res.status(400).json({ error: 'Query param "q" is required and must be non-empty.' });
      }

      const langData = getDataForLanguage(lang);
      const qLower = q.toLowerCase();

      // -----------------------------------------------------------------------
      // 1. Levels mode: search allLevels.js by text substring
      // -----------------------------------------------------------------------
      const levelsMatches = [];
      try {
        const [allLevels, sourceQuotes] = await Promise.all([
          loadAllLevels(lang),
          loadSourceQuotes(lang),
        ]);

        // Build normalized-text → first indexInFile map from source quotes
        const normToSourceIdx = new Map();
        for (let i = 0; i < sourceQuotes.length; i++) {
          const norm = normalizeText(sourceQuotes[i].text, lang);
          if (!normToSourceIdx.has(norm)) {
            normToSourceIdx.set(norm, i);
          }
        }

        for (let i = 0; i < allLevels.length; i++) {
          const level = allLevels[i];
          if (!level.text.toLowerCase().includes(qLower)) continue;
          const norm = normalizeText(level.text, lang);
          const indexInFile = normToSourceIdx.has(level.text)
            ? normToSourceIdx.get(level.text)
            : (normToSourceIdx.has(norm) ? normToSourceIdx.get(norm) : null);
          levelsMatches.push({
            mode: 'levels',
            levelIndex: i,
            indexInFile,
            sourceFile: langData.phraseSourceFile,
            text: level.text,
            name: level.name,
            desc: level.desc !== undefined ? level.desc : '',
            type: level.type,
          });
        }
      } catch (_e) {
        // File may not exist for this lang — skip
      }

      // -----------------------------------------------------------------------
      // 2. Daily mode: search dailyLevelsTexts.js by text substring
      // -----------------------------------------------------------------------
      const dailyMatches = [];
      try {
        const strings = await loadDailySource(lang);
        for (let i = 0; i < strings.length; i++) {
          const text = strings[i];
          if (!text.toLowerCase().includes(qLower)) continue;
          dailyMatches.push({
            mode: 'daily',
            indexInFile: i,
            text,
            name: langData.definitions,
            desc: '',
            type: 'science',
          });
        }
      } catch (_e) {
        // File may not exist — skip
      }

      // -----------------------------------------------------------------------
      // 3. Locations mode: search locationLevels.js across all buckets
      // Works for any lang with buckets (not gated to ru).
      // -----------------------------------------------------------------------
      const locationsMatches = [];
      try {
        const obj = await loadLocationLevels(lang);
        for (const [bucketKey, arr] of Object.entries(obj)) {
          if (!Array.isArray(arr)) continue;
          for (let i = 0; i < arr.length; i++) {
            const e = arr[i];
            if (!e.text || !e.text.toLowerCase().includes(qLower)) continue;
            locationsMatches.push({
              mode: 'locations',
              indexInFile: i,
              location: bucketKey,
              text: e.text,
              name: e.name,
              desc: e.desc !== undefined ? e.desc : '',
              type: e.type,
            });
          }
        }
      } catch (_e) {
        // File may not exist — skip
      }

      // -----------------------------------------------------------------------
      // 4. Source mode: search phrase source file by text substring
      // -----------------------------------------------------------------------
      const sourceMatches = [];
      try {
        const quotes = await loadSourceQuotes(lang);
        for (let i = 0; i < quotes.length; i++) {
          const q2 = quotes[i];
          if (!q2.text.toLowerCase().includes(qLower)) continue;
          sourceMatches.push({
            mode: 'source',
            indexInFile: i,
            sourceFile: langData.phraseSourceFile,
            text: q2.text,
            name: q2.name,
            desc: q2.desc !== undefined ? q2.desc : '',
            type: q2.type,
          });
        }
      } catch (_e) {
        // File may not exist — skip
      }

      // -----------------------------------------------------------------------
      // 5. Names mode: search allNames.js by name OR desc substring
      // -----------------------------------------------------------------------
      const namesMatches = [];
      try {
        const obj = await loadAllNames(lang);
        for (const [name, desc] of Object.entries(obj)) {
          const nameMatch = name.toLowerCase().includes(qLower);
          const descMatch = typeof desc === 'string' && desc.toLowerCase().includes(qLower);
          if (!nameMatch && !descMatch) continue;
          namesMatches.push({
            mode: 'names',
            name,
            desc: typeof desc === 'string' ? desc : '',
            text: name,
          });
        }
      } catch (_e) {
        // File may not exist — skip
      }

      // -----------------------------------------------------------------------
      // Aggregate in fixed order: levels, daily, locations, source, names
      // -----------------------------------------------------------------------
      const all = [
        ...levelsMatches,
        ...dailyMatches,
        ...locationsMatches,
        ...sourceMatches,
        ...namesMatches,
      ];

      const counts = {
        levels: levelsMatches.length,
        daily: dailyMatches.length,
        locations: locationsMatches.length,
        source: sourceMatches.length,
        names: namesMatches.length,
      };

      const total = all.length;
      const start = page * pageSize;
      const items = all.slice(start, start + pageSize);

      return res.json({
        lang,
        q,
        total,
        page,
        pageSize,
        items,
        counts,
      });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // Location-bucket translation helpers (shared by two endpoints below)
  // ---------------------------------------------------------------------------

  const LOCATIONS_JSON_PATH = path.join(__dirname, '..', 'src', 'locales', 'locations.json');

  async function loadLocationsTranslations() {
    const content = await fs.promises.readFile(LOCATIONS_JSON_PATH, 'utf8');
    return JSON.parse(content);
  }

  async function saveLocationsTranslations(obj) {
    await fs.promises.writeFile(LOCATIONS_JSON_PATH, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  }

  const SUPPORTED_TRANSLATION_LANGS = ['ru', 'en', 'fr', 'es', 'it', 'de'];
  const BUCKET_KEY_RE = /^\d{4}-\d{2}$/;

  // ---------------------------------------------------------------------------
  // GET /api/location-bucket/translations?key=YYYY-MM
  // Returns existing translations for a given key (or empty object if not found).
  // ---------------------------------------------------------------------------
  app.get('/api/location-bucket/translations', async (req, res, next) => {
    try {
      const { key } = req.query;
      if (typeof key !== 'string' || !BUCKET_KEY_RE.test(key)) {
        return res.status(400).json({ error: 'Query param "key" must match YYYY-MM.' });
      }

      const locations = await loadLocationsTranslations();
      const transKey = 'location' + key;
      const translations = (locations[transKey] && typeof locations[transKey] === 'object')
        ? locations[transKey]
        : {};

      return res.json({ key, translations });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // POST /api/location-bucket
  // Body: { lang, key, translations }
  // Creates a new empty bucket in locationLevels.js and writes translations.
  // ---------------------------------------------------------------------------
  app.post('/api/location-bucket', async (req, res, next) => {
    try {
      const { lang, key, translations } = req.body || {};

      // Validate lang
      getDataForLanguage(lang); // throws with statusCode 400 if invalid

      // Validate key
      if (typeof key !== 'string' || !BUCKET_KEY_RE.test(key)) {
        return res.status(400).json({ error: 'Field "key" must match YYYY-MM.' });
      }

      // Validate translations object
      if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
        return res.status(400).json({ error: 'Field "translations" must be an object.' });
      }
      for (const [, v] of Object.entries(translations)) {
        if (typeof v !== 'string') {
          return res.status(400).json({ error: 'Each translation value must be a string.' });
        }
      }

      // Validate at least one non-empty translation
      const hasNonEmpty = Object.values(translations).some(v => typeof v === 'string' && v.trim() !== '');
      if (!hasNonEmpty) {
        return res.status(400).json({ error: 'Provide at least one translation.' });
      }

      // Load location levels and check for existing bucket
      const buckets = await loadLocationLevels(lang);
      if (Object.prototype.hasOwnProperty.call(buckets, key)) {
        return res.status(409).json({ error: `Bucket "${key}" already exists in ${lang}.` });
      }

      // Create the empty bucket and save
      buckets[key] = [];
      await saveLocationLevels(lang, buckets);

      // Update translations in locations.json
      const locationsData = await loadLocationsTranslations();
      const transKey = 'location' + key;
      if (!locationsData[transKey] || typeof locationsData[transKey] !== 'object') {
        locationsData[transKey] = {};
      }
      for (const [langCode, value] of Object.entries(translations)) {
        if (!SUPPORTED_TRANSLATION_LANGS.includes(langCode)) continue;
        if (typeof value === 'string' && value.trim() !== '') {
          locationsData[transKey][langCode] = value.trim();
        }
        // Empty string: don't overwrite existing value — skip
      }
      await saveLocationsTranslations(locationsData);

      return res.json({ ok: true, lang, key, translations: locationsData[transKey] });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // POST /api/generate-levels?lang=<lang>&count=<n>
  // Generates up to `count` new levels using the same algorithm as the unified CLI.
  // CPU-bound and synchronous — can take 10–60 seconds for ru with count=100.
  // ---------------------------------------------------------------------------
  app.post('/api/generate-levels', async (req, res, next) => {
    try {
      const { lang } = req.query;

      // Validate lang
      const langData = getDataForLanguage(lang);

      // Validate count: default to 100 only when not provided; if provided, validate range
      const rawCount = req.query.count !== undefined ? parseInt(req.query.count, 10) : 100;
      const count = Number.isNaN(rawCount) ? 100 : rawCount;
      if (count < 1 || count > 1000) {
        return res.status(400).json({ error: `count must be between 1 and 1000, got ${req.query.count}.` });
      }

      const langConfig = configForLanguages[lang];

      // Load sources and current levels
      const [sourceQuotes, allLevels] = await Promise.all([
        loadSourceQuotes(lang),
        loadAllLevels(lang),
      ]);

      // Mirror createLevel.cjs runCli filtering
      const filtered = sourceQuotes.filter(q => {
        const len = q.text.length;
        if (langConfig.minLen > 0 && len < langConfig.minLen) return false;
        if (langConfig.maxLen > 0 && len > langConfig.maxLen) return false;
        if (langConfig.foreignScriptRegex && langConfig.foreignScriptRegex.test(q.text)) return false;
        if (langConfig.badWordFilter && testTextForBadWords(q.text)) return false;
        if (langConfig.excludedNames && langConfig.excludedNames.includes(q.name)) return false;
        return true;
      });

      // Safety guard: if fewer valid source phrases than requested, fail early.
      // (Some may already be levels and get skipped inside the generator loop,
      //  but this prevents an infinite loop when the pool is clearly too small.)
      if (filtered.length < count) {
        return res.status(422).json({
          error: `Only ${filtered.length} valid source phrases available, requested ${count}.`,
        });
      }

      // Apply ё→е normalization to phrase texts when configured
      if (langConfig.normalizeYo) {
        for (const q of filtered) {
          q.text = q.text.replace(/ё/gi, 'е');
        }
      }

      shuffleArray(filtered);

      const typesOfCategories = ['quotes', 'poems', 'aphorisms', 'music', 'cinema', 'science'];
      const state = {
        allLevels,
        allQuotes: filtered,
        notUsedTypes: typesOfCategories.slice(),
        typesOfCategories,
        allLevelsTexts: allLevels.map(l => l.text),
      };

      const before = allLevels.length;
      const target = before + count;

      addWordsToLevelsUntill(target, 50, 270, 3, 0.05, lang, state);

      // Defensive: proceed with whatever was generated even if target not reached
      await saveAllLevels(lang, allLevels);

      return res.json({
        ok: true,
        lang,
        before,
        after: allLevels.length,
        added: allLevels.length - before,
        requested: count,
      });
    } catch (err) {
      next(err);
    }
  });

  // ---------------------------------------------------------------------------
  // Error middleware — catches all async exceptions forwarded via next(err)
  // ---------------------------------------------------------------------------
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    const status = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    if (status === 500) {
      console.error('[server error]', err);
    }
    res.status(status).json({ error: message });
  });

  // Vite dev middleware — dynamic import required because admin package is
  // "type": "module" which makes Vite ESM, but this file is CJS.
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    root: __dirname,
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Admin running on http://localhost:${port}`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
