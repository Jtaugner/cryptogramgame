import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  fetchQuote, putQuote, postQuote, deleteQuote,
  fetchDaily, putDaily, postDaily, deleteDaily,
  fetchLocation, putLocation, postLocation, deleteLocation,
  fetchName, putName, postName, deleteName,
} from './api';
import type { Mode, QuoteDetail, DailyDetail, LocationDetail, NameDetail } from './types';
import { TYPE_OPTIONS } from './types';
import CryptogramPreview from './CryptogramPreview';

// Standard quote/daily/locations edit target
interface QuoteEditTarget {
  lang: string;
  source: string;
  index: number;
  mode: Mode;
}

// Names mode edit target — uses name string as key, not index
interface NameEditTarget {
  lang: string;
  name: string;
  mode: 'names';
}

type EditTarget = QuoteEditTarget | NameEditTarget;

interface Props {
  // null means "create mode"
  target: EditTarget | null;
  lang: string;
  mode: Mode;
  // Default location value pre-filled for create in locations mode
  defaultLocation: string;
  onClose: () => void;
  // Called after a successful save or delete; parent is responsible for closing
  onSaved: () => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const S: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '48px 16px',
    zIndex: 100,
    overflowY: 'auto',
  },
  panel: {
    background: '#fff',
    borderRadius: 6,
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
    padding: 24,
    width: '100%',
    maxWidth: 640,
    boxSizing: 'border-box',
  },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#444' },
  input: { width: '100%', boxSizing: 'border-box', padding: '6px 8px', fontSize: 14, border: '1px solid #ccc', borderRadius: 4 },
  textarea5: { width: '100%', boxSizing: 'border-box', padding: '6px 8px', fontSize: 14, border: '1px solid #ccc', borderRadius: 4, resize: 'vertical', minHeight: 100 },
  textarea2: { width: '100%', boxSizing: 'border-box', padding: '6px 8px', fontSize: 14, border: '1px solid #ccc', borderRadius: 4, resize: 'vertical', minHeight: 56 },
  errorBox: { color: '#c00', background: '#fff0f0', border: '1px solid #f99', borderRadius: 4, padding: '8px 10px', marginBottom: 14, fontSize: 13 },
  warnBox: { background: '#fffbe6', border: '1px solid #f5d042', borderRadius: 4, padding: 8, marginBottom: 14, fontSize: 14 },
  previewNote: { fontSize: 12, color: '#888', marginBottom: 6 },
  btnRow: { display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' },
  btn: { padding: '7px 16px', fontSize: 14, borderRadius: 4, border: '1px solid #aaa', cursor: 'pointer', background: '#f5f5f5' },
  btnPrimary: { padding: '7px 16px', fontSize: 14, borderRadius: 4, border: 'none', cursor: 'pointer', background: '#2563eb', color: '#fff' },
  btnDanger: { padding: '7px 16px', fontSize: 14, borderRadius: 4, border: 'none', cursor: 'pointer', background: '#dc2626', color: '#fff', marginLeft: 'auto' },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function QuoteEditor({ target, lang, mode, defaultLocation, onClose, onSaved }: Props) {
  const isCreate = target === null;

  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('quotes');
  // Used only in names mode — the name key (read-only in edit, editable in create)
  const [nameKey, setNameKey] = useState('');
  const [nameDesc, setNameDesc] = useState('');

  // The last successfully loaded/saved detail — used for the cryptogram preview.
  const [savedHiddenIndexes, setSavedHiddenIndexes] = useState<number[] | null>(null);
  const [savedText, setSavedText] = useState('');
  // True when the user has edited text but not yet saved
  const [textDirty, setTextDirty] = useState(false);

  // Whether the loaded item is present in the target file
  const [matchedInAllLevels, setMatchedInAllLevels] = useState(true);

  const [addMany, setAddMany] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when in edit mode
  useEffect(() => {
    if (isCreate || target === null) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    if (mode === 'names') {
      const nameTarget = target as { lang: string; name: string; mode: 'names' };
      fetchName(nameTarget.lang, nameTarget.name, ctrl.signal)
        .then((detail: NameDetail) => {
          setNameKey(detail.name);
          setNameDesc(detail.desc);
        })
        .catch(err => {
          if ((err as { name?: string }).name !== 'AbortError') {
            setError((err as Error).message);
          }
        })
        .finally(() => setLoading(false));
    } else {
      const quoteTarget = target as { lang: string; source: string; index: number; mode: Mode };
      const { index } = quoteTarget;

      if (mode === 'daily') {
        fetchDaily(lang, index, ctrl.signal)
          .then((detail: DailyDetail) => {
            setText(detail.text);
            setName(detail.name);
            setDesc(detail.desc);
            setType(detail.type);
            setSavedHiddenIndexes(detail.hiddenIndexes);
            setSavedText(detail.text);
            setMatchedInAllLevels(detail.matchedInTarget);
            setTextDirty(false);
          })
          .catch(err => {
            if ((err as { name?: string }).name !== 'AbortError') {
              setError((err as Error).message);
            }
          })
          .finally(() => setLoading(false));
      } else if (mode === 'locations') {
        // quoteTarget.source holds the bucket key for locations mode
        const bucketKey = quoteTarget.source;
        fetchLocation(lang, bucketKey, index, ctrl.signal)
          .then((detail: LocationDetail) => {
            setText(detail.text);
            setName(detail.name);
            setDesc(detail.desc);
            setType(detail.type);
            setSavedHiddenIndexes(detail.hiddenIndexes);
            setSavedText(detail.text);
            setTextDirty(false);
          })
          .catch(err => {
            if ((err as { name?: string }).name !== 'AbortError') {
              setError((err as Error).message);
            }
          })
          .finally(() => setLoading(false));
      } else {
        fetchQuote(quoteTarget.lang, quoteTarget.source, index, ctrl.signal)
          .then((detail: QuoteDetail) => {
            setText(detail.text);
            setName(detail.name);
            setDesc(detail.desc);
            setType(detail.type);
            setSavedHiddenIndexes(detail.hiddenIndexes);
            setSavedText(detail.text);
            setMatchedInAllLevels(detail.matchedInAllLevels);
            setTextDirty(false);
          })
          .catch(err => {
            if ((err as { name?: string }).name !== 'AbortError') {
              setError((err as Error).message);
            }
          })
          .finally(() => setLoading(false));
      }
    }

    return () => ctrl.abort();
  }, []); // Only run once on mount — target doesn't change while editor is open

  const handleTextChange = (val: string) => {
    setText(val);
    setTextDirty(true);
  };

  // Build body omitting desc when empty (JSON.stringify drops undefined automatically)
  const descVal: string | undefined = desc.trim() !== '' ? desc : undefined;
  const locBody = (t: string): { text: string; name: string; desc?: string; type: string } =>
    ({ text: t, name, desc: descVal, type });
  const quoteBody = (t: string): { text: string; name: string; desc?: string; type: string } =>
    ({ text: t, name, desc: descVal, type });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setBulkProgress(null);
    // Local progress tracker so the catch block can read the current value
    // without relying on stale state from the closure.
    let progress: { done: number; total: number } | null = null;
    try {
      if (mode === 'names') {
        if (isCreate) {
          await postName(lang, { name: nameKey, desc: nameDesc });
        } else {
          const nameTarget = target as { lang: string; name: string; mode: 'names' };
          await putName(nameTarget.lang, nameTarget.name, { desc: nameDesc });
        }
        onSaved();
      } else if (mode === 'daily') {
        if (isCreate) {
          await postDaily(lang, text);
        } else {
          const quoteTarget = target as { lang: string; source: string; index: number; mode: Mode };
          const res = await putDaily(lang, quoteTarget.index, text);
          setSavedHiddenIndexes(res.regenerated ? res.regenerated.hiddenIndexes : null);
          setSavedText(res.regenerated ? res.regenerated.text : text);
          setMatchedInAllLevels(res.matchedInTarget);
          setTextDirty(false);
        }
        onSaved();
      } else if (mode === 'locations') {
        if (isCreate && addMany) {
          const segments = text.split(/\n{3,}/).map(s => s.trim()).filter(Boolean);
          progress = { done: 0, total: segments.length };
          setBulkProgress(progress);
          for (let i = 0; i < segments.length; i++) {
            await postLocation(lang, defaultLocation, locBody(segments[i]));
            progress = { done: i + 1, total: segments.length };
            setBulkProgress(progress);
          }
          setBulkProgress(null);
          alert(`Added ${segments.length} quotes`);
          onSaved();
        } else if (isCreate) {
          const res = await postLocation(lang, defaultLocation, locBody(text));
          setSavedHiddenIndexes(res.regenerated ? res.regenerated.hiddenIndexes : null);
          setSavedText(res.regenerated ? res.regenerated.text : text);
          setTextDirty(false);
          onSaved();
        } else {
          const quoteTarget = target as { lang: string; source: string; index: number; mode: Mode };
          const bucketKey = quoteTarget.source;
          const res = await putLocation(lang, bucketKey, quoteTarget.index, locBody(text));
          setSavedHiddenIndexes(res.regenerated ? res.regenerated.hiddenIndexes : null);
          setSavedText(res.regenerated ? res.regenerated.text : text);
          setTextDirty(false);
          onSaved();
        }
      } else {
        // source / levels modes — use standard quote endpoints
        if (isCreate && addMany) {
          const segments = text.split(/\n{3,}/).map(s => s.trim()).filter(Boolean);
          progress = { done: 0, total: segments.length };
          setBulkProgress(progress);
          for (let i = 0; i < segments.length; i++) {
            await postQuote(lang, quoteBody(segments[i]));
            progress = { done: i + 1, total: segments.length };
            setBulkProgress(progress);
          }
          setBulkProgress(null);
          alert(`Added ${segments.length} quotes`);
          onSaved();
        } else if (isCreate) {
          const res = await postQuote(lang, quoteBody(text));
          setSavedHiddenIndexes(res.regenerated.hiddenIndexes);
          setSavedText(res.regenerated.text);
          setTextDirty(false);
          onSaved();
        } else {
          const quoteTarget = target as { lang: string; source: string; index: number; mode: Mode };
          const res = await putQuote(quoteTarget.lang, quoteTarget.source, quoteTarget.index, quoteBody(text));
          setSavedHiddenIndexes(res.regenerated.hiddenIndexes);
          setSavedText(res.regenerated.text);
          setMatchedInAllLevels(res.matchedInAllLevels);
          setTextDirty(false);
          onSaved();
        }
      }
    } catch (err) {
      const msg = (err as Error).message;
      setError(
        progress !== null
          ? `Error after ${progress.done}/${progress.total}: ${msg}`
          : msg,
      );
      setBulkProgress(null);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    setSaving(true);
    setError(null);
    try {
      if (mode === 'names') {
        const nameTarget = target as { lang: string; name: string; mode: 'names' };
        await deleteName(nameTarget.lang, nameTarget.name);
      } else if (mode === 'daily') {
        const quoteTarget = target as { lang: string; source: string; index: number; mode: Mode };
        await deleteDaily(lang, quoteTarget.index);
      } else if (mode === 'locations') {
        const quoteTarget = target as { lang: string; source: string; index: number; mode: Mode };
        const bucketKey = quoteTarget.source;
        await deleteLocation(lang, bucketKey, quoteTarget.index);
      } else {
        const quoteTarget = target as { lang: string; source: string; index: number; mode: Mode };
        await deleteQuote(quoteTarget.lang, quoteTarget.source, quoteTarget.index);
      }
      onSaved();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  const disabled = saving || loading;

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const titleLabel = isCreate
    ? 'New entry'
    : mode === 'names'
      ? `Edit name: ${(target as { name: string }).name}`
      : mode === 'daily'
        ? `Edit daily #${(target as { index: number }).index}`
        : mode === 'locations'
          ? `Edit location entry #${(target as { index: number }).index}`
          : `Edit quote #${(target as { index: number }).index}`;

  return (
    <div style={S.overlay} onClick={handleBackdrop}>
      <div style={S.panel} onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>{titleLabel}</h2>

        {loading && <p style={{ color: '#888' }}>Loading…</p>}

        {error && <div style={S.errorBox}>{error}</div>}

        {/* Names mode editor */}
        {mode === 'names' && !loading && (
          <>
            <div style={S.field}>
              <label style={S.label}>Name</label>
              {isCreate ? (
                <input
                  style={S.input}
                  value={nameKey}
                  onChange={e => setNameKey(e.target.value)}
                  disabled={disabled}
                  placeholder="Author / source name"
                />
              ) : (
                <input
                  style={{ ...S.input, background: '#f5f5f5', color: '#888' }}
                  value={nameKey}
                  readOnly
                  title="Rename not supported. Use Delete + Add new."
                />
              )}
            </div>
            <div style={S.field}>
              <label style={S.label}>Description</label>
              <textarea
                style={S.textarea2}
                value={nameDesc}
                onChange={e => setNameDesc(e.target.value)}
                disabled={disabled}
                rows={2}
                placeholder="e.g. Russian poet and writer, 1799–1837"
              />
            </div>
            {!isCreate && (
              <p style={S.previewNote}>Rename not supported — use Delete + Add new.</p>
            )}
            <div style={S.btnRow}>
              <button
                style={disabled ? { ...S.btnPrimary, ...S.btnDisabled } : S.btnPrimary}
                onClick={handleSave}
                disabled={disabled}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                style={disabled ? { ...S.btn, ...S.btnDisabled } : S.btn}
                onClick={onClose}
                disabled={disabled}
              >
                Cancel
              </button>
              {!isCreate && (
                <button
                  style={disabled ? { ...S.btnDanger, ...S.btnDisabled } : S.btnDanger}
                  onClick={handleDelete}
                  disabled={disabled}
                >
                  Delete
                </button>
              )}
            </div>
          </>
        )}

        {/* All other modes */}
        {mode !== 'names' && (
          <>
            {/* Quote/levels mode: warn if not present in allLevels */}
            {(mode === 'source' || mode === 'levels') && !isCreate && !matchedInAllLevels && (
              <div style={S.warnBox}>
                This quote isn&apos;t currently a level (not present in <code>allLevels.js</code>). Saving will update the source file only. Use <strong>Add new</strong> to create a level entry instead.
              </div>
            )}

            {!loading && (
              <>
                {/* Bucket key label — shown in locations mode edit (read-only) */}
                {mode === 'locations' && !isCreate && target !== null && (
                  <p style={S.previewNote}>
                    Bucket: <strong>{(target as { source: string }).source}</strong>
                  </p>
                )}

                {isCreate && (mode === 'source' || mode === 'levels' || mode === 'locations') && (
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={addMany}
                        onChange={e => setAddMany(e.target.checked)}
                        disabled={disabled}
                      />
                      Add many (split by 3+ newlines)
                    </label>
                  </div>
                )}

                <div style={S.field}>
                  <label style={S.label}>Text</label>
                  <textarea
                    style={S.textarea5}
                    value={text}
                    onChange={e => handleTextChange(e.target.value)}
                    disabled={disabled}
                    rows={addMany ? 14 : 5}
                  />
                </div>

                {/* Name/desc/type fields — for source/levels/locations modes */}
                {(mode === 'source' || mode === 'levels' || mode === 'locations') && (
                  <>
                    <div style={S.field}>
                      <label style={S.label}>Name (author / title)</label>
                      <input
                        style={S.input}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={disabled}
                      />
                    </div>

                    <div style={S.field}>
                      <label style={S.label}>Description</label>
                      <textarea
                        style={S.textarea2}
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        disabled={disabled}
                        rows={2}
                      />
                    </div>

                    <div style={S.field}>
                      <label style={S.label}>Type</label>
                      <select
                        style={S.input}
                        value={type}
                        onChange={e => setType(e.target.value)}
                        disabled={disabled}
                      >
                        {TYPE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Cryptogram preview — for source/levels/daily/locations modes */}
                <div style={S.field}>
                  <label style={S.label}>Cryptogram preview</label>
                  {textDirty || savedHiddenIndexes === null ? (
                    <p style={S.previewNote}>Preview will update after save.</p>
                  ) : savedHiddenIndexes.length > 0 ? (
                    <CryptogramPreview
                      text={savedText}
                      hiddenIndexes={savedHiddenIndexes}
                    />
                  ) : (
                    <p style={S.previewNote}>
                      No hidden indexes available (entry may not be in target file).
                    </p>
                  )}
                </div>

                <div style={S.btnRow}>
                  <button
                    style={disabled ? { ...S.btnPrimary, ...S.btnDisabled } : S.btnPrimary}
                    onClick={handleSave}
                    disabled={disabled}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  {bulkProgress !== null && (
                    <span style={{ fontSize: 13, color: '#555', alignSelf: 'center' }}>
                      Saving {bulkProgress.done}/{bulkProgress.total}…
                    </span>
                  )}
                  <button
                    style={disabled ? { ...S.btn, ...S.btnDisabled } : S.btn}
                    onClick={onClose}
                    disabled={disabled}
                  >
                    Cancel
                  </button>
                  {!isCreate && (
                    <button
                      style={disabled ? { ...S.btnDanger, ...S.btnDisabled } : S.btnDanger}
                      onClick={handleDelete}
                      disabled={disabled}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
