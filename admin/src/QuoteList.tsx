import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { Mode, QuoteListItem, NameItem, SearchItem } from './types';
import { TYPE_COLORS, TYPE_COLORS_DEFAULT, MODE_COLORS } from './types';

interface Props {
  items: QuoteListItem[];
  nameItems: NameItem[];
  searchItems: SearchItem[];
  isSearch: boolean;
  searchTotal: number;
  total: number;
  filtered: number;
  loadingMore: boolean;
  hasMore: boolean;
  mode: Mode;
  onSelectItem: (item: QuoteListItem) => void;
  onSelectNameItem: (item: NameItem) => void;
  onSelectSearchItem: (item: SearchItem) => void;
  loadMore: () => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const container: CSSProperties = { marginTop: 8 };
const table: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
const th: CSSProperties = {
  textAlign: 'left',
  padding: '6px 8px',
  background: '#f0f0f0',
  borderBottom: '2px solid #ccc',
  fontWeight: 600,
  fontSize: 13,
  whiteSpace: 'nowrap',
};
const tdBase: CSSProperties = { padding: '6px 8px', borderBottom: '1px solid #eee', verticalAlign: 'top' };
const tdNum: CSSProperties = { ...tdBase, color: '#888', width: 110, whiteSpace: 'nowrap' };
const tdType: CSSProperties = { ...tdBase, width: 90, whiteSpace: 'nowrap' };
const tdText: CSSProperties = { ...tdBase, maxWidth: 0 };
const tdName: CSSProperties = { ...tdBase, width: 140 };
const trHover: CSSProperties = { cursor: 'pointer', background: '#fafafa' };
const trOrphan: CSSProperties = { cursor: 'not-allowed', background: '#fafafa', opacity: 0.6 };
// Type badge base style — colors are applied inline per type
const typeBadgeBase: CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 500,
};

function typeBadgeStyle(typeVal: string): CSSProperties {
  const colors = TYPE_COLORS[typeVal] ?? TYPE_COLORS_DEFAULT;
  return { ...typeBadgeBase, background: colors.bg, color: colors.text };
}
const levelBadge: CSSProperties = {
  display: 'inline-block',
  fontSize: 11,
  padding: '1px 6px',
  borderRadius: 10,
  background: '#dcfce7',
  color: '#166534',
  fontWeight: 700,
  marginBottom: 2,
};
const dailyBadge: CSSProperties = {
  display: 'inline-block',
  fontSize: 11,
  padding: '1px 6px',
  borderRadius: 10,
  background: '#cffafe',
  color: '#164e63',
  fontWeight: 700,
  marginBottom: 2,
};
const locationBadge: CSSProperties = {
  display: 'inline-block',
  fontSize: 11,
  padding: '1px 6px',
  borderRadius: 10,
  background: '#fef9c3',
  color: '#713f12',
  fontWeight: 700,
  marginBottom: 2,
};
const srcBadge: CSSProperties = {
  display: 'block',
  fontSize: 10,
  color: '#aaa',
};
const modeBadgeBase: CSSProperties = {
  display: 'inline-block',
  padding: '2px 7px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
};

function modeBadgeStyle(m: Mode): CSSProperties {
  const c = MODE_COLORS[m];
  return { ...modeBadgeBase, background: c.bg, color: c.text };
}
const emptyCell: CSSProperties = { padding: '20px 8px', color: '#888', textAlign: 'center' };
const statusRow: CSSProperties = {
  marginTop: 12,
  fontSize: 13,
  color: '#888',
  textAlign: 'center',
  padding: '8px 0',
};

// Truncate to ~80 chars
function truncate(text: string, max = 80): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '…';
}

export default function QuoteList({
  items,
  nameItems,
  searchItems,
  isSearch,
  searchTotal,
  total,
  filtered,
  loadingMore,
  hasMore,
  mode,
  onSelectItem,
  onSelectNameItem,
  onSelectSearchItem,
  loadMore,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Keep stable refs so the IntersectionObserver callback doesn't go stale
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;
  const loadingMoreRef = useRef(loadingMore);
  loadingMoreRef.current = loadingMore;
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  // Set up IntersectionObserver on the sentinel element
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingMoreRef.current) {
          loadMoreRef.current();
        }
      },
      { rootMargin: '200px' }, // trigger 200px before the element is visible
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []); // runs once — ref values are always up-to-date

  // Global search mode: aggregate results across all modes with a leading Mode badge column
  if (isSearch) {
    return (
      <div style={container}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Mode</th>
              <th style={th}>#</th>
              <th style={th}>Type</th>
              <th style={th}>Text</th>
              <th style={th}>Name</th>
            </tr>
          </thead>
          <tbody>
            {searchItems.length === 0 && !loadingMore && (
              <tr>
                <td colSpan={5} style={emptyCell}>No results</td>
              </tr>
            )}
            {searchItems.map((item, idx) => {
              const isOrphan = item.mode === 'levels' && item.indexInFile === null;
              const identifier = item.mode === 'levels'
                ? `Level #${item.levelIndex + 1}`
                : item.mode === 'daily'
                  ? `Daily #${item.indexInFile + 1}`
                  : item.mode === 'locations'
                    ? `${item.location} #${item.indexInFile}`
                    : item.mode === 'names'
                      ? item.name
                      : `#${item.indexInFile}`;
              const displayName = item.mode === 'names' ? '' : item.name || '—';
              const displayType = (item.mode === 'names' || item.mode === 'daily' || item.mode === 'locations')
                ? null
                : item.type;
              return (
                <tr
                  key={`search:${item.mode}:${idx}`}
                  style={isOrphan ? trOrphan : trHover}
                  onClick={() => { if (!isOrphan) onSelectSearchItem(item); }}
                  onMouseEnter={e => {
                    if (!isOrphan) {
                      (e.currentTarget as HTMLTableRowElement).style.background = '#eef2ff';
                    }
                  }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
                >
                  <td style={{ ...tdBase, width: 80, whiteSpace: 'nowrap' }}>
                    <span style={modeBadgeStyle(item.mode as Mode)}>{MODE_COLORS[item.mode as Mode].label}</span>
                  </td>
                  <td style={tdNum}>
                    <span style={{ fontSize: 12 }}>{identifier}</span>
                    {isOrphan && (
                      <span style={{ ...srcBadge, color: '#f87171' }}>(orphan)</span>
                    )}
                  </td>
                  <td style={tdType}>
                    {displayType !== null
                      ? <span style={typeBadgeStyle(displayType)}>{displayType || '—'}</span>
                      : <span style={{ color: '#bbb', fontSize: 12 }}>—</span>
                    }
                  </td>
                  <td style={tdText}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                      {item.mode === 'names'
                        ? (item.desc || <em style={{ color: '#bbb' }}>no description</em>)
                        : truncate(item.text)}
                    </span>
                  </td>
                  <td style={tdName}>{displayName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Sentinel for IntersectionObserver */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {/* Status message below the list */}
        <div style={statusRow}>
          {loadingMore && <span>Loading more…</span>}
          {!hasMore && !loadingMore && (
            <span>End of list ({searchTotal} total matches)</span>
          )}
        </div>
      </div>
    );
  }

  // Names mode renders a different layout (name + desc preview, no type badge)
  if (mode === 'names') {
    return (
      <div style={container}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Description</th>
            </tr>
          </thead>
          <tbody>
            {nameItems.length === 0 && !loadingMore && (
              <tr>
                <td colSpan={2} style={emptyCell}>No results</td>
              </tr>
            )}
            {nameItems.map((item, idx) => (
              <tr
                key={`name:${idx}:${item.name}`}
                style={trHover}
                onClick={() => onSelectNameItem(item)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLTableRowElement).style.background = '#eef2ff';
                }}
                onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
              >
                <td style={{ ...tdBase, width: 240, fontWeight: 500 }}>{item.name}</td>
                <td style={{ ...tdText, color: '#666' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                    {item.desc || <em style={{ color: '#bbb' }}>no description</em>}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Sentinel for IntersectionObserver */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {/* Status message below the list */}
        <div style={statusRow}>
          {loadingMore && <span>Loading more…</span>}
          {!hasMore && !loadingMore && (
            <span>End of list ({total} total · {filtered} matching)</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>#</th>
            <th style={th}>Type</th>
            <th style={th}>Text</th>
            <th style={th}>Name</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && !loadingMore && (
            <tr>
              <td colSpan={4} style={emptyCell}>No results</td>
            </tr>
          )}
          {items.map((item, idx) => {
            const isOrphan = item.levelIndex !== null && item.indexInFile === null;
            return (
              <tr
                key={`${item.levelIndex ?? ''}:${item.indexInFile ?? ''}:${idx}`}
                style={isOrphan ? trOrphan : trHover}
                onClick={() => { if (!isOrphan) onSelectItem(item); }}
                onMouseEnter={e => {
                  if (!isOrphan) {
                    (e.currentTarget as HTMLTableRowElement).style.background = '#eef2ff';
                  }
                }}
                onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
              >
                <td style={tdNum}>
                  {mode === 'daily' ? (
                    <>
                      <span style={dailyBadge}>Daily #{(item.indexInFile ?? 0) + 1}</span>
                      <span style={srcBadge}>src #{item.indexInFile}</span>
                    </>
                  ) : mode === 'locations' ? (
                    <>
                      <span style={locationBadge}>{item.location ?? '?'}</span>
                      <span style={srcBadge}>#{item.indexInFile}</span>
                      {item.name && <span style={{ ...srcBadge, color: '#bbb' }}>{item.name}</span>}
                    </>
                  ) : item.levelIndex !== null ? (
                    <>
                      <span style={levelBadge}>Level #{item.levelIndex + 1}</span>
                      {item.indexInFile !== null ? (
                        <span style={srcBadge}>src #{item.indexInFile}</span>
                      ) : (
                        <span style={{ ...srcBadge, color: '#f87171' }}>(orphan — no source)</span>
                      )}
                    </>
                  ) : (
                    <span>#{item.indexInFile}</span>
                  )}
                </td>
                <td style={tdType}>
                  <span style={typeBadgeStyle(item.type)}>{item.type || '—'}</span>
                </td>
                <td style={tdText}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                    {truncate(item.text)}
                  </span>
                </td>
                <td style={tdName}>{item.name || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Sentinel for IntersectionObserver */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* Status message below the list */}
      <div style={statusRow}>
        {loadingMore && <span>Loading more…</span>}
        {!hasMore && !loadingMore && (
          <span>End of list ({total} total · {filtered} matching)</span>
        )}
      </div>
    </div>
  );
}
