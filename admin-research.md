# Generator Scripts Audit Report
**Generated:** 2026-04-28  
**Scope:** Three cryptogram level-generator scripts before unification into single CLI  
**Status:** Research-only, no modifications made

---

## 1. Per-Script Summary

### Script 1: `/creatingLevels/createLevel.cjs` (Main/Default)

**Language:** English (default, but parameterized)

**Inputs (require):**
- `const { levelsData } = require(`./${language}/output.js`)` — language-specific phrase corpus
- `dailyLevelsTexts = require(`./${language}/dailyLevelsTexts.js`)` — daily level texts
- `allLevels = require(`../src/levels/${language}/allLevels.js`)` — existing generated levels
- `allNames = require(`../src/levels/${language}/allNames.js`)` — author/name dict
- `allDailyLevels = require(`../src/levels/${language}/dailyLevels.js`)` — existing daily levels

**Outputs (fsp.writeFile):**
- `../src/levels/${language}/allNames.js` — author dict with empty string values
- `../src/levels/${language}/allLevels.js` — all cryptogram levels (export default array)
- `../src/levels/${language}/dailyLevels.js` — daily levels (conditionally, if new)

**Top-level constants:**
- `language = 'en'` (line 4) — default language
- `doUpdate = false` (line 5) — controls whether writes execute
- `DELETE_ALL_BEFORE = false` (line 21) — debug flag to reset allLevels
- `complexity = 4`, `fullness = 0.05` (lines 234-235) — generation parameters

**Module exports:**
```javascript
module.exports = {
    createLevel: createLevel
};
```

**Side effects on require():**
- Loads all 5 file dependencies immediately
- Populates `allLevelsTexts` by iterating `allLevels` (lines 27–29)
- Calls `shuffleArray(allQuotes)` at module load (line 239)
- **CRITICAL:** Executes entire level generation loop (lines 294–332) at module load
- Executes entire daily level generation loop (lines 377–392) at module load
- Executes allNames augmentation and file writes (lines 399–446) at module load

**No `require.main === module` guard** — all execution happens unconditionally

---

### Script 2: `/creatingLevels/ru/createLevel.cjs`

**Language:** Russian (hardcoded)

**Inputs (require):**
- `var {phrases} = require('./newCitats.js')` — Russian phrase corpus (note: uses `newCitats`, not `citats`)
- `var {dailyLevels} = require('./dailyLevelsTexts.js')` — Russian daily texts
- `var {locationLevels} = require('./locationCitats.js')` — **UNIQUE**: location-specific quotes/citats
- `allLevels = require('../../src/levels/ru/allLevels.js')` — existing levels
- `allNamesBefore = require(`../../src/levels/ru/allNames.js`)` — snapshot of old authors (used to delete them later)

**Outputs (fsp.writeFile):**
- `./allNames.js` — author dict (in `creatingLevels/ru/`, NOT under `src/levels/`)
- `./levelsList.js` — all cryptogram levels (in `creatingLevels/ru/`)
- `./dailyLevelsList.js` — daily levels (in `creatingLevels/ru/`)
- `./locationLevelsList.js` — **UNIQUE**: location levels (in `creatingLevels/ru/`)

**Top-level constants:**
- `phrases` (from newCitats.js) — main phrase array
- `dailyLevels` (from dailyLevelsTexts.js) — daily texts
- `locationLevels` (from locationCitats.js) — location citats
- `typesOfCategories = ['quotes', 'poems', 'aphorisms', 'music', 'cinema', 'science']` (line 194)
- `complexity = 4`, `fullness = 0.05` (lines 177–178)

**Module exports:**
- **NONE** — no `module.exports` statement

**Side effects on require():**
- Loads all 5 file dependencies immediately
- Executes target-level loop: `while(allLevels.length !== 4000)` (line 226)
- Executes daily level loop (lines 295–319)
- Executes location level loop (lines 325–352)
- Executes allNames augmentation with filtering (lines 382–402)
- **Executes all writes immediately** without `doUpdate` guard (lines 407–425)

**Output location:** `creatingLevels/ru/` (NOT `src/levels/ru/`)

---

### Script 3: `/creatingLevels/en/createLevel-en.cjs`

**Language:** English (hardcoded)

**Inputs (require):**
- `var {phrases} = require('./englishCitats.js')` — English phrase corpus
- `var {dailyLevels} = require('./dailyLevelsTexts-en.js')` — English daily texts (note: `-en` suffix)
- `const allLevelsEN = require('../../src/levels/en/allLevels.js')` — existing levels

**Outputs (fsp.writeFile):**
- `./allNames-en.js` — author dict (in `creatingLevels/en/`, with `-en` suffix)
- `./levelsList-en.js` — all levels (in `creatingLevels/en/`, with `-en` suffix)
- `./dailyLevelsList-en.js` — daily levels (in `creatingLevels/en/`, with `-en` suffix)

**Top-level constants:**
- `phrases` (from englishCitats.js)
- `dailyLevels` (from dailyLevelsTexts-en.js)
- `typesOfCategories` (line 185)
- `complexity = 4`, `fullness = 0.05` (lines 169–170)

**Module exports:**
- **NONE** — no `module.exports` statement

**Side effects on require():**
- Loads all 3 file dependencies immediately
- Executes target-level loop: `while(allLevels.length !== 450)` (line 202)
- Executes daily level loop (lines 316–340)
- Executes allNames augmentation (lines 289–299)
- **Executes all writes immediately** without guard (lines 305–345)

**Output location:** `creatingLevels/en/` (NOT `src/levels/en/`)

---

## 2. Function Inventory Across Scripts

| Function | Main (createLevel.cjs) | RU (ru/createLevel.cjs) | EN (en/createLevel-en.cjs) | Identical? | Notes |
|----------|----------------------|------------------------|-----------------------------|-----------|-------|
| `generateCryptogram()` | ✓ (lines 81–218) | ✓ (lines 28–161) | ✓ (lines 19–153) | **DIFFER** | See Section 3 |
| `replaceLongDashes()` | ✓ (lines 221–223) | ✓ (lines 164–166) | ✓ (lines 156–158) | **IDENTICAL** | All: `/—/g` → `-` |
| `createLevel()` | ✓ (lines 268–291) | **NONE** | **NONE** | N/A | Only in main script |
| `testTextForBadWords()` | ✓ (lines 242–254) | ✓ (lines 211–223) | **NONE** | **IDENTICAL** | Same 17 Russian bad-word list |
| `trimRandom()` | ✓ (lines 255–265) | **NONE** | **NONE** | N/A | Only in main script |
| `shuffleArray()` | ✓ (lines 422–428) | ✓ (lines 181–187) | ✓ (lines 173–179) | **IDENTICAL** | Fisher-Yates shuffle |
| `addWordsToLevelsUntill()` | ✓ (lines 338–366) | **NONE** | **NONE** | N/A | Only in main script |

### Key Difference: `generateCryptogram()` Complexity Handling

**Main script (createLevel.cjs, lines 111–122):**
```javascript
let startedIndex = 5;
if(complexity === 0) startedIndex = 11;          // ← Special case for 0
if(complexity <= 2){                             // ← Uses <=
    for(let i = 0; i < startedIndex; i++){
        visibleLetters.add(sortedByFrequency[i]);
    }
}
if(complexity <= 1){                             // ← Uses <=
    for(let i = startedIndex; i < ...; i++){
        visibleLetters.add(sortedByFrequency[i]);
    }
}
```

**RU & EN scripts (lines 57–67 / 48–58):**
```javascript
const startedIndex = 5;                          // ← No complexity 0 case
if(complexity === 1 || complexity === 2){        // ← Uses === (not <=)
    for(let i = 0; i < startedIndex; i++){
        visibleLetters.add(sortedByFrequency[i]);
    }
}
if(complexity === 1){                            // ← Uses === (not <=)
    for(let i = startedIndex; i < ...; i++){
        visibleLetters.add(sortedByFrequency[i]);
    }
}
```

**Impact:** Different hidden letter visibility for complexity 0, 2 (main) vs complexity 1, 2 (ru/en).

### Key Difference: Infinite Loop Guard

**Main script:** Lines 182–193 in `generateCryptogram()` — has `tries` counter with 300-iteration limit, returns `null` on timeout
```javascript
let tries = 0;
while(showLetterIndexes.size/totalLetters < fullness){
    // ...
    tries++;
    if(tries > 300) return null;
}
```

**RU & EN scripts:** Lines 128–134 and 120–126 — **NO infinite loop guard**
```javascript
while(showLetterIndexes.size/totalLetters < fullness){
    // ... can loop forever
}
```

---

## 3. Language-Specific Behaviors (Critical Differences)

### 3.1 Input Sources

| Aspect | Main (parameterized 'en') | RU | EN |
|--------|--------------------------|----|----|
| Phrase source | `${language}/output.js` (levelsData export) | `./newCitats.js` (phrases export) | `./englishCitats.js` (phrases export) |
| Daily source | `${language}/dailyLevelsTexts.js` | `./dailyLevelsTexts.js` | `./dailyLevelsTexts-en.js` (note: `-en`) |
| Location source | **NOT READ** | `./locationCitats.js` | **NOT READ** |
| Existing levels | `../src/levels/${language}/allLevels.js` | `../../src/levels/ru/allLevels.js` | `../../src/levels/en/allLevels.js` |

**Implication:** RU script has location-based levels (e.g., famous places/authors), EN does not.

### 3.2 Output Targets (Different Paths!)

| Aspect | Main (parameterized) | RU | EN |
|--------|----------------------|----|-----|
| allNames | `../src/levels/${language}/allNames.js` | `./allNames.js` (in creatingLevels/ru/) | `./allNames-en.js` (in creatingLevels/en/) |
| allLevels | `../src/levels/${language}/allLevels.js` | `./levelsList.js` (in creatingLevels/ru/) | `./levelsList-en.js` (in creatingLevels/en/) |
| dailyLevels | `../src/levels/${language}/dailyLevels.js` | `./dailyLevelsList.js` (in creatingLevels/ru/) | `./dailyLevelsList-en.js` (in creatingLevels/en/) |
| locationLevels | N/A | `./locationLevelsList.js` (in creatingLevels/ru/) | N/A |

**BLOCKER:** RU and EN write to `creatingLevels/{lang}/` but main writes to `src/levels/{lang}/`. This is a **path mismatch** that will cause unification to fail unless clarified.

### 3.3 Level Generation Target

| Script | Target Count |
|--------|--------------|
| Main | Flexible: 4 levels initially, then 500+ via `addWordsToLevelsUntill()` |
| RU | **4000 levels** (hard target, line 226) |
| EN | **450 levels** (hard target, line 202) |

**Implication:** Unification requires parameterized target or language-specific mapping.

### 3.4 Text Validation (Filtering Rules)

**Main script (lines 274–275):**
```javascript
if(dataForLanguages[language].isLetterRegex.test(text[text.length-1])){
    text += '.'
}
```
Uses language-specific regex (`isLetterRegex`), applied AFTER level generation.

**RU script (lines 231–232):**
```javascript
text = replaceLongDashes(text.replace(/ё/gi, 'е'));  // Replace ё with е
if(/[a-z]/ig.test(text) || text.length < 100 || text.length > 300 || testTextForBadWords(text)){
    continue;
}
```
- Replaces Cyrillic `ё` with `е` (normalization for Russian)
- Length constraints: 100–300 chars
- Tests for Latin letters (rejects if found)
- Tests for bad words

**EN script (lines 206–207):**
```javascript
text = replaceLongDashes(text.replace(/ё/gi, 'е'));
if(/[а-я]/ig.test(text) || text.length > 250){  // Max 250, no min
    continue;
}
```
- Also replaces `ё` (unnecessary for English, but present)
- Length constraint: max 250, **no minimum**
- Tests for Cyrillic letters (rejects if found)
- **NO bad word test**

**Impact:** EN levels can be very short; RU has explicit bad-word filtering (e.g., 'секс', 'героин'); main is configurable.

### 3.5 allNames Handling

**Main script (lines 399–408):**
```javascript
allLevels.forEach(level => {
    if(!allNames[level.name]){
        allNames[level.name] = "";  // Empty string value
    }
});
```
Sets empty strings, does NOT count.

**RU script (lines 382–402):**
```javascript
let allNames = {};
allLevels.forEach(level => {
    if(!allNames[level.name]){
        allNames[level.name] = "";
    }
});
newLocationLevels.forEach(level => {  // Add location authors
    if(!allNames[level.name]){
        allNames[level.name] = "";
    }
});
Object.keys(allNamesBefore).forEach(name => {  // Delete old authors
    delete allNames[name];
});
```
Includes location authors, **explicitly removes previously seen names**.

**EN script (lines 289–295):**
```javascript
let allNames = {};
allLevels.forEach(level => {
    if(!allNames[level.name]){
        allNames[level.name] = 1;     // Numeric count!
    }else{
        allNames[level.name]++;
    }
});
```
**Counts occurrences** (numeric values, not empty strings).

**CRITICAL DIVERGENCE:** EN counts author occurrences; main & RU use empty strings. This will break if unified without careful handling.

### 3.6 Output Schema

All three produce objects with fields: `text`, `hiddenIndexes`, `name`, `type`.

**Main & RU:** May also output `desc` (description field) — see lines 287–290 (main) vs 278 (ru)
```javascript
levelData.desc = phrase.desc;  // RU script does this
```

**EN:** Also outputs `desc` — see line 245:
```javascript
levelData.desc = phrase.desc;
```

**Checked in actual output files:**
- `src/levels/ru/allLevels.js` line 2: `{..., "desc": "Римский политик...", ...}`
- `src/levels/en/allLevels.js` line 2: `{..., "desc": "South African president...", ...}`

All three produce identical shape: `{text, hiddenIndexes, name, desc, type}` ✓

### 3.7 Daily Levels Handling

**Main script (lines 380–392):**
```javascript
if(dailyLevelsTexts.length > allDailyLevels.length){
    isAddDaily = true;
    newDailyLevels = [...allDailyLevels];
    for(let i = allDailyLevels.length; i < dailyLevelsTexts.length; i++){
        text = dailyLevelsTexts[i];
        // ... create level, add to newDailyLevels
    }
}
// Conditional write: if(isAddDaily)
```
Incremental: only writes if new texts available.

**RU script (lines 295–319):**
```javascript
dailyLevels.forEach(text => {
    // ... process each
    levelData.name = 'Определения и понятия'  // Russian for "Definitions and concepts"
    levelData.desc = '';
    levelData.type = 'quotes';
    newDailyLevels.push(levelData);
});
// Always writes
```
Iterates all daily texts, always rewrites.

**EN script (lines 316–340):**
```javascript
dailyLevels.forEach(text => {
    // ... process each
    levelData.name = 'Definitions'
    levelData.desc = '';
    levelData.type = 'quotes';
    newDailyLevels.push(levelData);
});
// Always writes
```
Same as RU, but English text for name.

**Implication:** Main is incremental (safer for updates), RU & EN are full rewrites.

---

## 4. dataForLanguages Configuration Table

### Full Structure (from main script, lines 31–78):

```javascript
const dataForLanguages = {
    ru: {
        vowels: 'АЕЁИОУЫЭЮЯ',
        consonants: 'БВГДЖЗЙКЛМНПРСТФХЦЧШЩ',
        notLettersRegex: /[^А-Яа-яЁё]/gi,
        isLetterRegex: /[А-Яа-яЁё]/i,
        definitions: 'Определения и понятия'
    },
    en: {
        vowels: 'AEIOUY',
        consonants: 'BCDFGHJKLMNPQRSTVWXZ',
        notLettersRegex: /[^A-Za-z]/gi,
        isLetterRegex: /[A-Za-z]/i,
        definitions: 'Definitions'
    },
    de: {
        vowels: 'AEIOUYÄÖÜ',
        consonants: 'BCDFGHJKLMNPQRSTVWXZß',
        notLettersRegex: /[^A-Za-zÄÖÜäöüß]/gi,
        isLetterRegex: /[A-Za-zÄÖÜäöüß]/i,
        definitions: 'Definitionen und Begriffe'
    },
    es: {
        vowels: 'AEIOUÁÉÍÓÚÜ',
        consonants: 'BCDFGHJKLMNÑPQRSTVWXZ',
        notLettersRegex: /[^A-Za-zÁÉÍÓÚáéíóúÑñ]/gi,
        isLetterRegex: /[A-Za-zÁÉÍÓÚáéíóúÑñ]/i,
        definitions: 'Definiciones y conceptos'
    },
    fr: {
        vowels: 'AEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛÜŸ',
        consonants: 'BCDFGHJKLMNPQRSTVWXZÇ',
        notLettersRegex: /[^A-Za-zÀÂÉÈÊËÎÏÔÙÛÜŸÆÇŒàâéèêëîïôùûüÿæçœ]/ig,
        isLetterRegex: /[A-Za-zÀÂÉÈÊËÎÏÔÙÛÜŸÆÇŒàâéèêëîïôùûüÿæçœ]/i,
        definitions: 'Définitions et notions'
    },
    it: {
        vowels: 'AEIOUÀÈÉÌÍÒÓÙÚ',
        consonants: 'BCDFGHJKLMNPQRSTVWXZ',
        notLettersRegex: /[^A-Za-zÀÈÉÌÒÙàèéìòù]/gi,
        isLetterRegex: /[A-Za-zÀÈÉÌÒÙàèéìòù]/i,
        definitions: 'Definizioni e concetti'
    }
}
```

**Divergence Check:**

- **RU script:** Hardcodes vowels/consonants/regex in `generateCryptogram()` (lines 29–30), does NOT use `dataForLanguages`
- **EN script:** Also hardcodes (lines 20–21), does NOT use `dataForLanguages`

**CRITICAL BLOCKER:** `dataForLanguages` exists only in main script but is referenced in `generateCryptogram()` via `dataForLanguages[language].*`. RU & EN hardcode these values inline. Unification must ensure all six language entries are accessible and used consistently.

---

## 5. Output Schema Verification

**Confirmed via sample output files:**

**`src/levels/ru/allLevels.js` (line 2):**
```json
{"text":"Пришел, увидел, победил.","hiddenIndexes":[5,12,18,20],"name":"Гай Юлий Цезарь","desc":"Римский политик, полководец и писатель","type":"quotes"}
```

**`src/levels/en/allLevels.js` (line 3):**
```json
{"text":"It always seems impossible until it's done.","hiddenIndexes":[18,21,30,31],"name":"Nelson Mandela","desc":"South African president and activist","type":"quotes"}
```

**Schema:** All languages produce `{text, hiddenIndexes, name, desc, type}` ✓

**No per-language divergence in output structure.**

---

## 6. Risks & Unifiability Assessment

### High-Priority Blockers

1. **Output Path Mismatch** (CRITICAL)
   - Main writes to `../src/levels/${lang}/`
   - RU writes to `./` (creatingLevels/ru/)
   - EN writes to `./` (creatingLevels/en/)
   - **Fix required:** Decide canonical output path before unification

2. **allNames Value Type Divergence** (CRITICAL)
   - Main & RU: empty strings `""`
   - EN: numeric counts (1, 2, 3, ...)
   - **Fix required:** Standardize to one type; consider breaking EN consumers

3. **Infinite Loop Risk in RU & EN generateCryptogram()** (CRITICAL)
   - No timeout guard; can loop forever on difficult phrases
   - Main has 300-iteration safeguard
   - **Fix required:** Backport timeout guard to unified version

4. **Complexity Algorithm Divergence** (MODERATE)
   - Main supports complexity 0 (additional case)
   - RU & EN treat 1 & 2 identically
   - **Fix required:** Clarify intended complexity model; main is more flexible

5. **Level Generation Targets** (MODERATE)
   - Main: flexible (4–500+)
   - RU: fixed 4000
   - EN: fixed 450
   - **Fix required:** Parameterize target or remove hard targets

### Medium-Priority Issues

6. **Text Validation Differences**
   - RU & EN replace `ё→е` (normalization) — should main?
   - RU has min length 100; EN has none
   - EN has no bad-word test
   - **Fix required:** Generalize validation logic or make language-specific

7. **Daily Levels Strategy**
   - Main: incremental (only new entries)
   - RU & EN: full rewrite
   - **Fix required:** Choose strategy; incremental is safer

8. **Location Levels** (RU-only)
   - RU generates `locationLevelsList.js`
   - Other languages skip entirely
   - **Decision needed:** Keep location levels? Extend to other languages?

9. **Module Execution Model** (CRITICAL for CLI)
   - All three execute generation at require-time, no `require.main === module` guard
   - Unified CLI will require separating config from execution
   - **Fix required:** Add guard pattern to make it importable without side effects

10. **dataForLanguages Usage**
    - Defined in main but not used by RU/EN (they hardcode)
    - Unified script must ensure all six languages in dataForLanguages are applied uniformly
    - **Fix required:** Enforce single source of truth

### Low-Priority Issues

11. **File Naming Conventions**
    - Main: no language suffix (relies on language param)
    - EN: `-en` suffixes (allNames-en.js, levelsList-en.js, dailyLevelsList-en.js)
    - RU: plain names (allNames.js, levelsList.js)
    - **Minor fix:** Standardize naming

12. **Code Organization**
    - createLevel() function only in main; absent in RU/EN
    - trimRandom(), addWordsToLevelsUntill() only in main
    - RU/EN inline their level-building loops
    - **Refactor:** Extract common patterns

---

## Summary of Unifiability

**CAN be straightforwardly unified:** ✓
- Function implementations (shuffleArray, replaceLongDashes) are identical
- Output schema is identical across all three
- Alphabet/regex definitions are correct and comprehensive

**CANNOT be unified without behavior changes (Blockers):** ✗
1. Output path mismatch (main vs ru/en)
2. allNames value type divergence (strings vs numbers)
3. Infinite loop guard missing in RU/EN
4. Hard-coded level targets (4000 vs 450 vs flexible)

**Recommendation:** Address blockers 1–4 explicitly before attempting unification. The unified CLI should:
- Accept `--lang ru|en|de|es|fr|it`
- Standardize output to `src/levels/{lang}/` (recommend keeping main's path)
- Change all allNames to empty strings (safer, matches main/RU)
- Apply 300-iteration timeout guard in generateCryptogram()
- Parameterize level targets via CLI flag or config

---

**End of Report**
