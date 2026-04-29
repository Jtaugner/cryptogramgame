import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { fetchLanguages, fetchLocations, fetchQuotes, fetchNames, searchAll, generateLevels, fetchLocationBucketTranslations, createLocationBucket } from './api';
import type { Mode, LevelsSort, QuoteListItem, NameItem, SearchItem, SearchResponse, LocationDescriptor } from './types';
import { TYPE_OPTIONS } from './types';
import QuoteList from './QuoteList';
import QuoteEditor from './QuoteEditor';

const PAGE_SIZE = 100;

// ---------------------------------------------------------------------------
// Migrate legacy localStorage key
// ---------------------------------------------------------------------------
function readInitialMode(): Mode {
  try {
    // Check for new key first
    const stored = localStorage.getItem('admin.mode');
    if (stored === 'source' || stored === 'levels' || stored === 'daily' || stored === 'locations' || stored === 'names') {
      return stored;
    }
    // Migrate old boolean key
    const legacy = localStorage.getItem('admin.onlyLevels');
    if (legacy !== null) {
      localStorage.removeItem('admin.onlyLevels');
      return legacy === '1' ? 'levels' : 'source';
    }
  } catch {
    // localStorage unavailable
  }
  return 'levels';
}

function readInitialLevelsSort(): LevelsSort {
  try {
    const stored = localStorage.getItem('admin.levelsSort');
    if (stored === 'asc' || stored === 'desc') return stored;
  } catch {
    // localStorage unavailable
  }
  return 'asc';
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles: Record<string, CSSProperties> = {
  app: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    minHeight: '100vh',
    background: '#f8f9fa',
    color: '#222',
  },
  topBar: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: '#1e293b',
    color: '#fff',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    marginRight: 8,
    whiteSpace: 'nowrap',
  },
  topBarLabel: {
    fontSize: 12,
    opacity: 0.7,
    display: 'block',
    marginBottom: 2,
  },
  select: {
    padding: '5px 8px',
    fontSize: 13,
    borderRadius: 4,
    border: '1px solid #555',
    background: '#334155',
    color: '#fff',
    cursor: 'pointer',
  },
  searchInput: {
    padding: '5px 8px',
    fontSize: 13,
    borderRadius: 4,
    border: '1px solid #555',
    background: '#334155',
    color: '#fff',
    minWidth: 200,
    flex: '1 1 200px',
  },
  addBtn: {
    padding: '6px 14px',
    fontSize: 13,
    borderRadius: 4,
    border: 'none',
    background: '#22c55e',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  generateBtn: {
    marginLeft: 'auto',
    padding: '8px 14px',
    fontSize: 14,
    borderRadius: 4,
    border: 'none',
    background: '#f97316',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  sortBtn: {
    padding: '6px 12px',
    fontSize: 14,
    borderRadius: 4,
    border: '1px solid #d1d5db',
    background: '#f3f4f6',
    color: '#374151',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  main: {
    padding: '20px',
    maxWidth: 1100,
    margin: '0 auto',
  },
  errorBanner: {
    background: '#fff0f0',
    border: '1px solid #f99',
    color: '#c00',
    padding: '10px 14px',
    borderRadius: 4,
    marginBottom: 14,
    fontSize: 13,
  },
  infoNote: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
    borderLeft: '3px solid #e0e0e0',
    paddingLeft: 8,
  },
  warnNote: {
    fontSize: 12,
    color: '#92400e',
    background: '#fffbe6',
    border: '1px solid #f5d042',
    borderRadius: 4,
    padding: '6px 10px',
    marginBottom: 12,
  },
};

// ---------------------------------------------------------------------------
// Helpers for Add Location modal
// ---------------------------------------------------------------------------

const TRANSLATION_LANGS: Array<{ code: string; label: string }> = [
  { code: 'ru', label: 'Russian' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
  { code: 'de', label: 'German' },
];

const BUCKET_KEY_RE = /^\d{4}-\d{2}$/;

/**
 * Compute the next YYYY-MM key (0-indexed month) after the last existing bucket.
 * If buckets is empty, returns current UTC year + 0-indexed month.
 */
function nextMonthAfterLastBucket(buckets: LocationDescriptor[]): string {
  if (buckets.length === 0) {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth()).padStart(2, '0')}`;
  }
  const sorted = buckets.map(b => b.key).sort();
  const last = sorted[sorted.length - 1];
  const [yearStr, monthStr] = last.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  month += 1;
  if (month > 11) {
    month = 0;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function App() {
  const [languages, setLanguages] = useState<string[]>([]);
  const [lang, setLang] = useState('ru');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  // Mode persisted to localStorage as 'admin.mode'. Default is 'levels'.
  const [mode, setMode] = useState<Mode>(readInitialMode);
  // Location filter for 'locations' mode
  const [availableLocations, setAvailableLocations] = useState<LocationDescriptor[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  // Incrementing this triggers a list re-fetch without changing other deps
  const [refreshCount, setRefreshCount] = useState(0);
  // True while generate-levels request is in flight
  const [generating, setGenerating] = useState(false);
  // Sort order for levels mode only; persisted to localStorage as 'admin.levelsSort'
  const [levelsSort, setLevelsSort] = useState<LevelsSort>(readInitialLevelsSort);

  // Add location modal state
  const [addLocationModalOpen, setAddLocationModalOpen] = useState(false);
  const [addLocId, setAddLocId] = useState('');
  const [addLocTranslations, setAddLocTranslations] = useState<Record<string, string>>({});
  const [addLocError, setAddLocError] = useState<string | null>(null);
  const [addLocSaving, setAddLocSaving] = useState(false);
  // Ref to abort in-flight prefill fetch when ID changes
  const addLocFetchCtrlRef = useRef<AbortController | null>(null);

  // Infinite scroll state — accumulated across pages (quote modes)
  const [items, setItems] = useState<QuoteListItem[]>([]);
  // Separate accumulator for names mode
  const [nameItems, setNameItems] = useState<NameItem[]>([]);
  // Accumulator for global search results
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchCounts, setSearchCounts] = useState<SearchResponse['counts'] | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Track loaded pages without causing re-renders — only used inside callbacks
  const loadedPagesRef = useRef(0);

  // Editor state: null = closed; object = edit (quotes) or name edit; 'create' = create mode
  const [editorTarget, setEditorTarget] = useState<{ lang: string; source: string; index: number; mode: Mode } | { lang: string; name: string; mode: 'names' } | 'create' | null>(null);
  const [sourceFile, setSourceFile] = useState('');

  // Persist mode to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('admin.mode', mode);
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [mode]);

  // Persist levelsSort to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('admin.levelsSort', levelsSort);
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [levelsSort]);

  // Fetch available locations when mode is 'locations'
  useEffect(() => {
    if (mode !== 'locations') {
      setAvailableLocations([]);
      setSelectedLocation('');
      return;
    }
    const ctrl = new AbortController();
    fetchLocations(lang, ctrl.signal)
      .then(locs => {
        setAvailableLocations(locs);
        setSelectedLocation(prev => {
          const stillValid = locs.some(d => d.key === prev);
          return stillValid ? prev : (locs[0]?.key ?? '');
        });
      })
      .catch(err => {
        if ((err as { name?: string }).name !== 'AbortError') {
          setListError((err as Error).message);
        }
      });
    return () => ctrl.abort();
  }, [mode, lang]);

  // Debounce search via ref to avoid stale closure
  const searchRef = useRef(search);
  searchRef.current = search;
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchRef.current), 300);
    return () => clearTimeout(id);
  }, [search]);

  // Load languages once
  useEffect(() => {
    const ctrl = new AbortController();
    fetchLanguages(ctrl.signal)
      .then(langs => {
        setLanguages(langs);
        if (langs.length > 0 && !langs.includes('ru')) {
          setLang(langs[0]);
        }
      })
      .catch(err => {
        if ((err as { name?: string }).name !== 'AbortError') {
          setListError((err as Error).message);
        }
      });
    return () => ctrl.abort();
  }, []);

  // Ref to abort ongoing page-0 fetch when filters change
  const resetCtrlRef = useRef<AbortController | null>(null);

  // When filters or refreshCount change: reset list and fetch page 0.
  // When debouncedSearch is non-empty: use global search (ignores mode/type).
  // For 'locations' mode with empty search: wait until a location is selected.
  useEffect(() => {
    if (!lang) return;
    // In global search mode we don't need a location
    if (!debouncedSearch && mode === 'locations' && !selectedLocation) return;

    // Abort any in-flight reset fetch
    if (resetCtrlRef.current) {
      resetCtrlRef.current.abort();
    }
    const ctrl = new AbortController();
    resetCtrlRef.current = ctrl;

    setItems([]);
    setNameItems([]);
    setSearchItems([]);
    setSearchCounts(null);
    setSearchTotal(0);
    loadedPagesRef.current = 0;
    setHasMore(true);
    setListError(null);
    setLoadingMore(true);

    if (debouncedSearch) {
      // Global search across all modes
      searchAll(lang, debouncedSearch, 0, PAGE_SIZE, ctrl.signal)
        .then(data => {
          setSearchItems(data.items);
          setSearchTotal(data.total);
          setSearchCounts(data.counts);
          loadedPagesRef.current = 1;
          setHasMore(data.items.length < data.total);
        })
        .catch(err => {
          if ((err as { name?: string }).name !== 'AbortError') {
            setListError((err as Error).message);
          }
        })
        .finally(() => {
          if (!ctrl.signal.aborted) {
            setLoadingMore(false);
          }
        });
    } else if (mode === 'names') {
      fetchNames(lang, debouncedSearch, 0, PAGE_SIZE, ctrl.signal)
        .then(data => {
          setTotalCount(data.total);
          setFilteredCount(data.filtered);
          setNameItems(data.items);
          loadedPagesRef.current = 1;
          setHasMore(data.items.length < data.filtered);
        })
        .catch(err => {
          if ((err as { name?: string }).name !== 'AbortError') {
            setListError((err as Error).message);
          }
        })
        .finally(() => {
          if (!ctrl.signal.aborted) {
            setLoadingMore(false);
          }
        });
    } else {
      fetchQuotes({
        lang,
        search: debouncedSearch,
        type: typeFilter,
        page: 0,
        pageSize: PAGE_SIZE,
        mode,
        location: mode === 'locations' ? selectedLocation : undefined,
        sort: mode === 'levels' ? levelsSort : undefined,
        signal: ctrl.signal,
      })
        .then(data => {
          setSourceFile(data.sourceFile);
          setTotalCount(data.total);
          setFilteredCount(data.filtered);
          setItems(data.items);
          loadedPagesRef.current = 1;
          setHasMore(data.items.length < data.filtered);
        })
        .catch(err => {
          if ((err as { name?: string }).name !== 'AbortError') {
            setListError((err as Error).message);
          }
        })
        .finally(() => {
          if (!ctrl.signal.aborted) {
            setLoadingMore(false);
          }
        });
    }

    return () => ctrl.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, debouncedSearch, typeFilter, mode, selectedLocation, refreshCount, levelsSort]);

  // loadMore: fetches the next page and appends; called by QuoteList's IntersectionObserver
  const loadMore = useCallback(() => {
    if (!lang || !hasMore || loadingMore) return;
    if (!debouncedSearch && mode === 'locations' && !selectedLocation) return;

    const nextPage = loadedPagesRef.current;
    setLoadingMore(true);

    if (debouncedSearch) {
      searchAll(lang, debouncedSearch, nextPage, PAGE_SIZE)
        .then(data => {
          setSearchItems(existing => {
            const merged = [...existing, ...data.items];
            setHasMore(merged.length < data.total);
            return merged;
          });
          setSearchTotal(data.total);
          setSearchCounts(data.counts);
          loadedPagesRef.current = nextPage + 1;
        })
        .catch(err => {
          if ((err as { name?: string }).name !== 'AbortError') {
            setListError((err as Error).message);
          }
        })
        .finally(() => setLoadingMore(false));
    } else if (mode === 'names') {
      fetchNames(lang, debouncedSearch, nextPage, PAGE_SIZE)
        .then(data => {
          setNameItems(existing => {
            const merged = [...existing, ...data.items];
            setHasMore(merged.length < data.filtered);
            return merged;
          });
          setFilteredCount(data.filtered);
          setTotalCount(data.total);
          loadedPagesRef.current = nextPage + 1;
        })
        .catch(err => {
          if ((err as { name?: string }).name !== 'AbortError') {
            setListError((err as Error).message);
          }
        })
        .finally(() => setLoadingMore(false));
    } else {
      fetchQuotes({
        lang,
        search: debouncedSearch,
        type: typeFilter,
        page: nextPage,
        pageSize: PAGE_SIZE,
        mode,
        location: mode === 'locations' ? selectedLocation : undefined,
        sort: mode === 'levels' ? levelsSort : undefined,
      })
        .then(data => {
          setItems(existing => {
            const merged = [...existing, ...data.items];
            setHasMore(merged.length < data.filtered);
            return merged;
          });
          setFilteredCount(data.filtered);
          setTotalCount(data.total);
          loadedPagesRef.current = nextPage + 1;
        })
        .catch(err => {
          if ((err as { name?: string }).name !== 'AbortError') {
            setListError((err as Error).message);
          }
        })
        .finally(() => setLoadingMore(false));
    }
  }, [lang, debouncedSearch, typeFilter, mode, selectedLocation, hasMore, loadingMore, levelsSort]);

  const handleSelectItem = (item: QuoteListItem) => {
    if (item.indexInFile === null) return;
    // In locations mode the "source" is the bucket key (stored in item.location)
    const src = mode === 'locations' ? (item.location ?? selectedLocation) : sourceFile;
    setEditorTarget({ lang, source: src, index: item.indexInFile, mode });
  };

  const handleSelectNameItem = (item: NameItem) => {
    setEditorTarget({ lang, name: item.name, mode: 'names' });
  };

  // When a search result row is clicked, open the editor in THAT item's mode.
  const handleSelectSearchItem = (item: SearchItem) => {
    if (item.mode === 'names') {
      setEditorTarget({ lang, name: item.name, mode: 'names' });
      return;
    }
    if (item.mode === 'levels' || item.mode === 'source') {
      if (item.indexInFile === null) return; // orphan level — uneditable
      setEditorTarget({ lang, source: item.sourceFile, index: item.indexInFile, mode: item.mode });
      return;
    }
    if (item.mode === 'daily') {
      setEditorTarget({ lang, source: 'dailyLevelsTexts.js', index: item.indexInFile, mode: 'daily' });
      return;
    }
    if (item.mode === 'locations') {
      // Use source = bucket key so the editor knows which bucket this entry belongs to
      setEditorTarget({ lang, source: item.location, index: item.indexInFile, mode: 'locations' });
      return;
    }
  };

  const handleAddNew = () => {
    setEditorTarget('create');
  };

  const handleEditorClose = () => {
    setEditorTarget(null);
  };

  const handleEditorSaved = () => {
    setEditorTarget(null);
    setRefreshCount(c => c + 1);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    // Reset type filter when switching away from modes that use it
    if (newMode === 'daily' || newMode === 'names') {
      setTypeFilter('');
    }
  };

  const handleGenerate = async () => {
    if (!window.confirm(`Generate 100 new levels for ${lang}? This may take 10–60 seconds.`)) return;
    setGenerating(true);
    try {
      const result = await generateLevels(lang, 100);
      window.alert(`Added ${result.added} levels (${result.before} → ${result.after})`);
      setRefreshCount(c => c + 1);
    } catch (err) {
      window.alert((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenAddLocation = () => {
    const initialId = nextMonthAfterLastBucket(availableLocations);
    setAddLocId(initialId);
    setAddLocTranslations({});
    setAddLocError(null);
    setAddLocationModalOpen(true);
  };

  const handleAddLocationSave = async () => {
    if (!BUCKET_KEY_RE.test(addLocId)) return;
    const hasNonEmpty = TRANSLATION_LANGS.some(({ code }) => (addLocTranslations[code] ?? '').trim() !== '');
    if (!hasNonEmpty) return;
    setAddLocSaving(true);
    setAddLocError(null);
    try {
      const result = await createLocationBucket({ lang, key: addLocId, translations: addLocTranslations });
      setAddLocationModalOpen(false);
      // Refresh the available-locations list and select the new bucket
      const newLocs = await fetchLocations(lang);
      setAvailableLocations(newLocs);
      setSelectedLocation(result.key);
    } catch (err) {
      setAddLocError((err as Error).message);
    } finally {
      setAddLocSaving(false);
    }
  };

  // Debounced prefill: when addLocId changes (and modal is open), fetch existing translations
  const addLocIdRef = useRef(addLocId);
  addLocIdRef.current = addLocId;

  useEffect(() => {
    if (!addLocationModalOpen || !BUCKET_KEY_RE.test(addLocId)) return;

    if (addLocFetchCtrlRef.current) {
      addLocFetchCtrlRef.current.abort();
    }
    const ctrl = new AbortController();
    addLocFetchCtrlRef.current = ctrl;

    const timerId = setTimeout(() => {
      fetchLocationBucketTranslations(addLocIdRef.current, ctrl.signal)
        .then(data => {
          if (!ctrl.signal.aborted) {
            setAddLocTranslations(prev => {
              // Pre-fill only fields the user hasn't already typed in
              const merged: Record<string, string> = { ...prev };
              for (const [k, v] of Object.entries(data.translations)) {
                if (!merged[k]) {
                  merged[k] = v;
                }
              }
              return merged;
            });
          }
        })
        .catch(() => { /* ignore — key may not exist */ });
    }, 300);

    return () => {
      clearTimeout(timerId);
      ctrl.abort();
    };
  // We intentionally re-run when addLocId or addLocationModalOpen changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addLocId, addLocationModalOpen]);

  const showTypeFilter = mode !== 'daily' && mode !== 'locations' && mode !== 'names';

  return (
    <div style={styles.app}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <span style={styles.title}>Cryptogram Admin</span>

        <div>
          <span style={styles.topBarLabel}>Language</span>
          <select
            style={styles.select}
            value={lang}
            onChange={e => setLang(e.target.value)}
          >
            {languages.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <span style={styles.topBarLabel}>Mode</span>
          <select
            style={styles.select}
            value={mode}
            onChange={e => handleModeChange(e.target.value as Mode)}
          >
            <option value="levels">Levels</option>
            <option value="source">Source</option>
            <option value="daily">Daily</option>
            <option value="locations">Locations</option>
            <option value="names">Names</option>
          </select>
        </div>

        {/* Location picker — only shown in locations mode */}
        {mode === 'locations' && availableLocations.length > 0 && (
          <div>
            <span style={styles.topBarLabel}>Bucket</span>
            <select
              style={styles.select}
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
            >
              {availableLocations.map(d => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ flex: '1 1 200px' }}>
          <span style={styles.topBarLabel}>
            {debouncedSearch ? 'Search (all content)' : 'Search'}
          </span>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Filter by text…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {debouncedSearch && searchCounts !== null && (
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginTop: 2 }}>
              {([] as string[]).concat(
                searchCounts.levels > 0 ? [`${searchCounts.levels} levels`] : [],
                searchCounts.daily > 0 ? [`${searchCounts.daily} daily`] : [],
                searchCounts.locations > 0 ? [`${searchCounts.locations} locations`] : [],
                searchCounts.source > 0 ? [`${searchCounts.source} source`] : [],
                searchCounts.names > 0 ? [`${searchCounts.names} names`] : [],
              ).join(' · ') || 'no results'}
            </span>
          )}
        </div>

        {showTypeFilter && (
          <div>
            <span style={styles.topBarLabel}>Type</span>
            <select
              style={styles.select}
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">(any)</option>
              {TYPE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            style={debouncedSearch ? { ...styles.addBtn, opacity: 0.4, cursor: 'not-allowed' } : styles.addBtn}
            onClick={debouncedSearch ? undefined : handleAddNew}
            title={debouncedSearch ? 'Clear search to add a new entry' : undefined}
            disabled={!!debouncedSearch}
          >+ Add new</button>

          {mode === 'locations' && (
            <button
              style={{
                padding: '6px 14px',
                fontSize: 13,
                borderRadius: 4,
                border: 'none',
                background: '#3b82f6',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              onClick={handleOpenAddLocation}
            >+ Add location</button>
          )}

          {mode === 'levels' && (
            <button
              style={styles.sortBtn}
              onClick={() => setLevelsSort(s => s === 'asc' ? 'desc' : 'asc')}
              title="Toggle sort order"
            >
              {levelsSort === 'asc' ? 'Sort: ↑ first → last' : 'Sort: ↓ last → first'}
            </button>
          )}

          {mode === 'levels' && (
            <button
              style={generating ? { ...styles.generateBtn, opacity: 0.6, cursor: 'not-allowed' } : styles.generateBtn}
              onClick={generating ? undefined : handleGenerate}
              disabled={generating}
            >{generating ? 'Generating…' : 'Generate 100 levels'}</button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        {mode === 'locations' && availableLocations.length === 0 && !loadingMore && (
          <div style={styles.warnNote}>
            No location buckets defined for this language. Use the &ldquo;+ Add location&rdquo; button above to create one.
          </div>
        )}

        {mode !== 'locations' && mode !== 'names' && (
          <p style={styles.infoNote}>
            {mode === 'daily'
              ? 'Daily mode: editing dailyLevelsTexts.js source and dailyLevels.js target.'
              : mode === 'levels'
                ? 'Levels mode: entries from allLevels.js in level order.'
                : 'Source mode: all entries from the phrase source file.'}
          </p>
        )}

        {mode === 'names' && (
          <p style={styles.infoNote}>
            Names mode: editing allNames.js (author/source descriptions). Rename not supported — use Delete + Add new.
          </p>
        )}

        {listError && <div style={styles.errorBanner}>{listError}</div>}

        <QuoteList
          items={items}
          nameItems={nameItems}
          searchItems={searchItems}
          isSearch={!!debouncedSearch}
          searchTotal={searchTotal}
          total={totalCount}
          filtered={filteredCount}
          loadingMore={loadingMore}
          hasMore={hasMore}
          mode={mode}
          onSelectItem={handleSelectItem}
          onSelectNameItem={handleSelectNameItem}
          onSelectSearchItem={handleSelectSearchItem}
          loadMore={loadMore}
        />
      </div>

      {/* Editor modal */}
      {editorTarget !== null && (
        <QuoteEditor
          target={editorTarget === 'create' ? null : editorTarget}
          lang={lang}
          mode={editorTarget === 'create' ? mode : (editorTarget as { mode: Mode }).mode}
          defaultLocation={selectedLocation}
          onClose={handleEditorClose}
          onSaved={handleEditorSaved}
        />
      )}

      {/* Add location modal */}
      {addLocationModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={e => { if (e.target === e.currentTarget) setAddLocationModalOpen(false); }}
        >
          <div style={{
            background: '#fff', borderRadius: 8, padding: 24, width: 480,
            maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Add location</h2>

            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
              Location ID (YYYY-MM)
            </label>
            <input
              style={{
                width: '100%', boxSizing: 'border-box', padding: '6px 10px',
                fontSize: 14, borderRadius: 4,
                border: addLocId && !BUCKET_KEY_RE.test(addLocId) ? '1px solid #ef4444' : '1px solid #d1d5db',
                marginBottom: 4,
              }}
              value={addLocId}
              onChange={e => {
                setAddLocId(e.target.value);
                setAddLocError(null);
              }}
              placeholder="e.g. 2026-04"
            />
            {addLocId && !BUCKET_KEY_RE.test(addLocId) && (
              <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 12px' }}>
                Must match YYYY-MM (e.g. 2026-04).
              </p>
            )}
            {(!addLocId || BUCKET_KEY_RE.test(addLocId)) && <div style={{ marginBottom: 12 }} />}

            {TRANSLATION_LANGS.map(({ code, label }) => (
              <div key={code} style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', marginBottom: 2, fontSize: 13, fontWeight: 600 }}>
                  {label}
                </label>
                <input
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '6px 10px',
                    fontSize: 14, borderRadius: 4, border: '1px solid #d1d5db',
                  }}
                  value={addLocTranslations[code] ?? ''}
                  onChange={e => {
                    const v = e.target.value;
                    setAddLocTranslations(prev => ({ ...prev, [code]: v }));
                    setAddLocError(null);
                  }}
                  placeholder={`${label} name`}
                />
              </div>
            ))}

            {addLocError && (
              <p style={{ color: '#ef4444', fontSize: 13, margin: '8px 0' }}>{addLocError}</p>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                style={{
                  padding: '7px 16px', fontSize: 13, borderRadius: 4,
                  border: '1px solid #d1d5db', background: '#f3f4f6',
                  cursor: 'pointer', fontWeight: 600,
                }}
                onClick={() => setAddLocationModalOpen(false)}
                disabled={addLocSaving}
              >Cancel</button>
              <button
                style={{
                  padding: '7px 16px', fontSize: 13, borderRadius: 4, border: 'none',
                  background: '#3b82f6', color: '#fff', fontWeight: 600,
                  cursor: (
                    !BUCKET_KEY_RE.test(addLocId) ||
                    !TRANSLATION_LANGS.some(({ code }) => (addLocTranslations[code] ?? '').trim() !== '') ||
                    addLocSaving
                  ) ? 'not-allowed' : 'pointer',
                  opacity: (
                    !BUCKET_KEY_RE.test(addLocId) ||
                    !TRANSLATION_LANGS.some(({ code }) => (addLocTranslations[code] ?? '').trim() !== '') ||
                    addLocSaving
                  ) ? 0.5 : 1,
                }}
                onClick={handleAddLocationSave}
                disabled={
                  !BUCKET_KEY_RE.test(addLocId) ||
                  !TRANSLATION_LANGS.some(({ code }) => (addLocTranslations[code] ?? '').trim() !== '') ||
                  addLocSaving
                }
              >{addLocSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
