# Quote Management Admin — Implementation Plan

## Goal
Build a localhost admin tool (separate React+Vite app) for searching and editing cryptogram quotes per language. Edits regenerate level data via the existing generator and are written to **both** `creatingLevels/{lang}/...` (source) **and** `src/levels/{lang}/allLevels.js` (generated). The two stores must stay in sync.

## Constraints from the user
- **Tech**: separate React+Vite admin app.
- **Source of truth**: `creatingLevels/{lang}/*.js`. No unified storage. The save flow writes both `creatingLevels` and `src/levels`.
- **Edit flow**: full regeneration via the existing generator (variant A).
- **Generator algorithm**: must not change. Restructuring (extracting into a module) is allowed as long as behavior is preserved byte-for-byte.
- **Unification**: collapse `creatingLevels/createLevel.cjs`, `creatingLevels/ru/createLevel.cjs`, `creatingLevels/en/createLevel-en.cjs` into a single `creatingLevels/createLevel.cjs` that takes `--lang ru|en|de|es|fr|it`. Any extra logic in `ru/` and `en/` variants must be ported into the unified script.
- **Production isolation**: admin lives in `admin/` with its own `package.json` and `node_modules`. Root `package.json` only gets one new script (`admin`) that delegates via `cd admin && npm run dev`. No new dependencies in the root package.

## Decisions from S1 review (2026-04-28)

- **Algorithm**: adopt main's `generateCryptogram` everywhere. The complexity-branching divergence in RU/EN is not important (at default `complexity=4` all three are functionally equivalent; the divergence is in dead code at complexity ≤ 2). Keep main's 300-iteration timeout guard.
- **allNames**: do NOT generate `allNames.js` anymore. The unified generator stops writing this file. Existing `src/levels/{lang}/allNames.js` files stay untouched.
- **Output**: unified CLI writes ONLY to `src/levels/{lang}/`. Legacy `creatingLevels/{lang}/levelsList.js` / `levelsList-en.js` / `dailyLevelsList.js` / `locationLevelsList.js` outputs are dropped. Admin (S5+) still edits BOTH source citats in `creatingLevels/{lang}/*` AND output in `src/levels/{lang}/*`.
- **Per-language config split**: extract into TWO new files:
  - `creatingLevels/dataForLanguages.cjs` — alphabet (vowels/consonants), regex (`isLetterRegex`, `notLettersRegex`), level-count target, definitions text.
  - `creatingLevels/configForLanguages.cjs` — validation/filtering rules: `minLen`, `maxLen`, `normalizeYo` (ё→е), `badWordFilter` (currently `true` only for `ru`), foreign-script reject regex.
- **Daily levels**: full-rewrite strategy (RU/EN's behavior) for all languages.
- **Location levels**: stay as RU-only behavior.
- **Level-count targets** live inside `dataForLanguages.cjs`. Initial values: `ru: 4000, en: 450`. `de/es/fr/it`: TBD — generator will skip them at S2 (target left `null` → no level loop runs for those langs) until counts are decided.

## Subtasks

### S1 — Audit the three generator scripts (research only) [x]
**Owner**: Explore agent
**Goal**: Produce a written report (in `admin-research.md` at repo root, gitignored later) listing:
  - All differences between `creatingLevels/createLevel.cjs`, `creatingLevels/ru/createLevel.cjs`, `creatingLevels/en/createLevel-en.cjs`.
  - Which language-specific behaviors exist only in `ru/` or `en/` variants (extra word lists, dailyLevels handling, locationLevels handling, allNames handling, etc.).
  - The full list of input files each script reads from `creatingLevels/{lang}/*` and the output files each writes in `src/levels/{lang}/*`.
  - Any `module.exports` and what other code depends on them.
**Done when**: report file exists and lists every meaningful divergence.

### S2 — Extract generator into pure modules + apply S1 decisions [x]
**Owner**: developer
**Goal**:
1. Create `creatingLevels/dataForLanguages.cjs` exporting the existing `dataForLanguages` table (copied verbatim from main `createLevel.cjs`), augmented with `levelTarget` per language: `ru: 4000, en: 450, de/es/fr/it: null`.
2. Create `creatingLevels/configForLanguages.cjs` exporting per-language validation rules (`minLen`, `maxLen`, `normalizeYo`, `badWordFilter`, `foreignScriptRegex`). For ru: `{minLen: 100, maxLen: 300, normalizeYo: true, badWordFilter: true, foreignScriptRegex: /[a-z]/ig}`. For en: `{minLen: 0, maxLen: 250, normalizeYo: false, badWordFilter: false, foreignScriptRegex: /[а-я]/ig}`. For de/es/fr/it: sensible defaults (`minLen: 0, maxLen: 300, normalizeYo: false, badWordFilter: false, foreignScriptRegex: null`).
3. Create `creatingLevels/generator.cjs` exporting pure functions: `generateCryptogram`, `createLevel`, `replaceLongDashes`, `shuffleArray`, `trimRandom`, `testTextForBadWords`, `addWordsToLevelsUntill`. Functions copied verbatim from main `createLevel.cjs` (the algorithm with the 300-iteration guard and complexity-0 special case). NO top-level side effects.
4. Rewrite `creatingLevels/createLevel.cjs` to:
   - `require` from the three modules above.
   - Wrap CLI logic in `if (require.main === module) { runCli() }`.
   - Apply per-language validation from `configForLanguages` (replaces the inline filters main had).
   - Use `levelTarget` from `dataForLanguages` to drive the level loop (skip if `null`).
   - **Drop allNames generation entirely** — do not write `src/levels/{lang}/allNames.js`.
   - **Daily levels**: full rewrite strategy — iterate all entries from `dailyLevelsTexts` and rebuild `src/levels/{lang}/dailyLevels.js` from scratch every run (no incremental check).
   - Output written ONLY to `src/levels/{lang}/`. Do not write `creatingLevels/{lang}/levelsList.js` or similar legacy files.
   - Bad-word test runs only when `configForLanguages[lang].badWordFilter === true`.
5. Do NOT yet add `--lang` flag — that's S3. Keep the existing `language` constant at top of `createLevel.cjs` for now (default `'en'`).
6. Do NOT touch `creatingLevels/ru/createLevel.cjs` or `creatingLevels/en/createLevel-en.cjs` in this subtask.

**Verify**:
- `node -e "require('./creatingLevels/generator.cjs')"` runs without side effects (no console output, no file writes).
- `node -e "require('./creatingLevels/dataForLanguages.cjs')"` and `node -e "require('./creatingLevels/configForLanguages.cjs')"` succeed.
- With `doUpdate = false` set in `createLevel.cjs`, running `node creatingLevels/createLevel.cjs` completes without errors and prints the same kind of progress output as before (counts may differ slightly due to Math.random; that's fine).
- `git diff src/levels/en/allLevels.js` is empty after a `doUpdate=false` run.
- `npm run lint` and `npm run build:yandex` still succeed (these are runtime-side checks; the generator changes shouldn't affect runtime).

**Done when**: tester confirms all checks above pass.

### S3 — Unify the CLI: add --lang flag, RU location levels, deprecate legacy scripts [x]
**Owner**: developer
**Goal**:
1. Replace the top-level `const language = 'en'` and `const doUpdate = false` in `createLevel.cjs` with a CLI parser that supports:
   - `--lang <code>` (required; one of `ru|en|de|es|fr|it`)
   - `--update` (boolean flag; when present, sets `doUpdate=true`)
   - `--delete-all-before` (boolean flag; equivalent of `DELETE_ALL_BEFORE=true`)
   - `--help` (prints usage)
   Use the `language` resolved from `--lang` for all `require(`./${language}/...`)` and `require(`../src/levels/${language}/...`)` calls. If `--lang` is missing, print usage and exit non-zero.
2. Port the **only** RU-unique behavior remaining after S1 decisions: **location levels**.
   - Read `creatingLevels/ru/locationCitats.js` (`{ locationLevels }`).
   - Run the same level-creation pipeline used in legacy `ru/createLevel.cjs` (use `createLevel()` from `generator.cjs` with appropriate complexity/fullness — match the legacy values: complexity=3, fullness=0.05).
   - Write to `src/levels/ru/locationLevels.js` (NOT to `creatingLevels/ru/locationLevelsList.js`).
   - Run only when `language === 'ru'`. For other languages, skip this step entirely.
   - Gated by `--update` like all other writes.
3. Daily levels: keep S2's full-rewrite strategy (write to `src/levels/${language}/dailyLevels.js`).
4. Mark legacy scripts deprecated with a top-of-file comment pointing at the unified script. Do NOT delete them.
   - `creatingLevels/ru/createLevel.cjs`: prepend `// DEPRECATED: use \`node ../createLevel.cjs --lang ru\` from creatingLevels/. Kept for reference only.`
   - `creatingLevels/en/createLevel-en.cjs`: prepend `// DEPRECATED: use \`node ../createLevel.cjs --lang en\` from creatingLevels/. Kept for reference only.`
5. Add a small `--help` text at the top of `createLevel.cjs` documenting the flags.

**Verify**:
- `node creatingLevels/createLevel.cjs` (no args) prints usage and exits with non-zero code.
- `node creatingLevels/createLevel.cjs --lang de` runs cleanly: `levelTarget=null` skip path triggers, daily handling runs, no writes (since `--update` not passed), exit 0.
- `node creatingLevels/createLevel.cjs --lang ru --help` prints usage.
- `require('./creatingLevels/createLevel.cjs')` from a third file does NOT execute generation (require.main guard already in place from S2 — confirm still works).
- `git status` after a `--lang de` run (no `--update`) shows zero modifications under `src/`.
- Legacy `creatingLevels/ru/createLevel.cjs` and `creatingLevels/en/createLevel-en.cjs` start with the deprecation comment.

**Acceptance**: tester confirms above.

**Behavior change vs legacy** (already approved in user decisions): unified CLI uses main's algorithm, drops `allNames.js` generation, daily levels are full-rewrite, output goes only to `src/levels/{lang}/`, RU bad-word filter remains, location levels are RU-only. Byte-for-byte equivalence with legacy `ru/createLevel.cjs` / `en/createLevel-en.cjs` is NOT a goal and is intentionally not checked.

**Out of scope for S3**: actually running heavy `--lang ru --update` (4000 levels) or `--lang en --update` (450 levels) to regenerate disk content — the tester only does the smoke checks above. The admin in S5+ will exercise the unified CLI in earnest.

### S4 — Admin scaffold (`admin/`) [x]
**Owner**: developer
**Goal**: Create `admin/` with:
  - `admin/package.json` (own deps: vite, react, react-dom, typescript, @types/react, express, @types/express, vite-plugin-node or similar to integrate API in dev server, OR a separate node entry script).
  - `admin/vite.config.ts`, `admin/tsconfig.json`, `admin/index.html`, `admin/src/main.tsx`, `admin/src/App.tsx`.
  - `admin/server.cjs` — Express server that serves the API and (in dev) proxies the Vite UI.
  - `admin/.gitignore` for `node_modules`, `dist`.
**Verify**:
  - `cd admin && npm install && npm run dev` starts the app on a localhost port and the page renders.
  - Root `package.json` gets `"admin": "cd admin && npm run dev"` and nothing else changes.
  - Root `npm run build:yandex` still succeeds with no admin files in `dist/`.
**Done when**: tester confirms admin loads in browser AND production build is unchanged.

### S5 — Backend API [x]
**Owner**: developer
**Goal**: Implement these endpoints in `admin/server.cjs`:
  - `GET /api/languages` → list of languages that have files in `creatingLevels/`.
  - `GET /api/quotes?lang=ru&search=&type=&page=` → paginated list of quotes from `creatingLevels/{lang}` source files. Returns each quote with a stable identifier (use `{sourceFile, indexInFile}` since there are no IDs).
  - `GET /api/quote/:lang/:source/:index` → full quote + currently-saved `hiddenIndexes` from `src/levels/{lang}/allLevels.js` if present.
  - `PUT /api/quote/:lang/:source/:index` → body `{text, name, desc, type}`. Server:
    1. Updates the quote in the source file (`creatingLevels/{lang}/...`) by re-serializing the array.
    2. Calls the unified generator (`require('./creatingLevels/generator.cjs').createLevel`) to compute new `hiddenIndexes`.
    3. Updates the matching entry in `src/levels/{lang}/allLevels.js` (match by old text).
    4. Returns the regenerated entry.
  - `POST /api/quote/:lang` → add new quote (writes to source + appends to `src/levels`).
  - `DELETE /api/quote/:lang/:source/:index` → remove from both.
**Reading source files**: parse them via `require()` since they are CommonJS-friendly (`require('./creatingLevels/ru/citats.js')` etc., or use `vm` if some are ESM-only). For ESM `.js` files in `src/levels/`, write a small parser that reads the file as text, strips `export default`, and `eval`s it (or use `esbuild` to transform on the fly).
**Writing source files**: re-serialize as JS array literal, preserving the same formatting style as the existing files (the existing format is `export default [\n{...}, \n{...}\n]`).
**Verify**: `tester` agent hits each endpoint with `curl` and confirms responses + on-disk file changes.

### S6 — Frontend UI [x]
**Owner**: developer
**Goal**: Single-page React app with:
  - Language picker (top-right dropdown).
  - Search bar (filters by text substring; debounced).
  - Type filter (`quotes|poems|aphorisms|music|cinema|science`).
  - Quote list (virtualized if >500 entries; otherwise simple list).
  - Click on quote opens an editor panel/modal with fields: `text`, `name`, `desc`, `type`. "Save" calls `PUT`, on success shows the regenerated `hiddenIndexes` preview rendered as the actual cryptogram (letters visible vs `•`).
  - "Add new" button at top → POST.
  - "Delete" button in the editor with confirm.
**Verify**: visual-tester or tester agent confirms golden path (open → edit → save → quote in list reflects new text).

### S7 — Sync verification & end-to-end test
**Owner**: tester
**Goal**: After each save:
  - Source file in `creatingLevels/{lang}/` contains the new text.
  - `src/levels/{lang}/allLevels.js` contains a matching entry with regenerated `hiddenIndexes`.
  - The hidden index count is sane (>0, <text.length, all positions point to letters per the language regex).
  - Re-running the unified generator does not produce diffs for unchanged quotes (idempotency check).
**Done when**: tester runs the full happy path for at least `ru` and `en` and reports both green.

### S8 — Production-build isolation check
**Owner**: tester
**Goal**: Confirm that `npm run build:yandex` and `npm run build:gp` still produce the same `dist/` contents as before the admin was added (compare file list, `dist/index.html`, and total bundle size — tolerate timestamp/hash differences only).
**Done when**: report shows no admin assets leak into the prod bundle and bundle byte size is within ±1% of pre-admin baseline.

## Out of scope (do not do without asking)
- Changing the cryptogram generation algorithm.
- Touching `src/` runtime code (the game itself).
- Adding tests to the main project.
- Authentication on the admin (it's localhost-only).
- Editing `dailyLevels` or `locationLevels` in this iteration — only `allLevels`. Note this limitation in the admin UI.
- Deleting the legacy `ru/createLevel.cjs` and `en/createLevel-en.cjs` files (mark deprecated only).

## Stop conditions for the orchestrator
Per orchestrator's own description, stop and ask the user when:
- A subtask fails twice.
- The S1 audit reveals a divergence in the per-language scripts that can't be unified without changing algorithm behavior.
- Production-build isolation check (S8) fails.
