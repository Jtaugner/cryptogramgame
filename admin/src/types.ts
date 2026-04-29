// Shared TypeScript types matching the API response shapes.

export type Mode = 'source' | 'levels' | 'daily' | 'locations' | 'names';

export type LevelsSort = 'asc' | 'desc';

export interface QuoteListItem {
  levelIndex: number | null;
  indexInFile: number | null;
  text: string;
  name: string;
  desc: string;
  type: string;
  location?: string;
}

export interface QuotesResponse {
  lang: string;
  sourceFile: string;
  mode: Mode;
  total: number;
  filtered: number;
  page: number;
  pageSize: number;
  items: QuoteListItem[];
}

export interface QuoteDetail {
  lang: string;
  source: string;
  index: number;
  text: string;
  name: string;
  desc: string;
  type: string;
  hiddenIndexes: number[] | null;
  matchedInAllLevels: boolean;
}

// Detail shape for daily entries
export interface DailyDetail {
  lang: string;
  index: number;
  text: string;
  name: string;
  desc: string;
  type: string;
  hiddenIndexes: number[] | null;
  matchedInTarget: boolean;
}

// Detail shape for location entries
export interface LocationDetail {
  lang: string;
  location: string;
  index: number;
  text: string;
  name: string;
  desc: string;
  type: string;
  hiddenIndexes: number[] | null;
}

export interface SavedQuote {
  text: string;
  hiddenIndexes: number[];
  name: string;
  desc: string;
  type: string;
}

export interface PutResponse {
  ok: boolean;
  lang: string;
  source: string;
  index: number;
  regenerated: SavedQuote;
  matchedInAllLevels: boolean;
}

export interface PostResponse {
  ok: boolean;
  lang: string;
  source: string;
  index: number;
  regenerated: SavedQuote;
}

export interface DeleteResponse {
  ok: boolean;
  lang: string;
  source: string;
  index: number;
  matchedInAllLevels: boolean;
}

// Response shapes for daily endpoints
export interface DailyMutationResponse {
  ok: boolean;
  lang: string;
  index: number;
  regenerated: SavedQuote | null;
  matchedInTarget: boolean;
}

// Response shape for location mutation endpoints
export interface LocationMutationResponse {
  ok: boolean;
  lang: string;
  location: string;
  index: number;
  regenerated: SavedQuote | null;
}

export interface ErrorResponse {
  error: string;
}

// Location bucket descriptor returned by GET /api/locations
export interface LocationDescriptor {
  key: string;
  label: string;
  count: number;
}

export interface LocationsResponse {
  lang: string;
  locations: LocationDescriptor[];
}

// ---------------------------------------------------------------------------
// Global search types
// ---------------------------------------------------------------------------

export type SearchItem =
  | { mode: 'source'; indexInFile: number; sourceFile: string; text: string; name: string; desc: string; type: string }
  | { mode: 'levels'; indexInFile: number | null; levelIndex: number; sourceFile: string; text: string; name: string; desc: string; type: string }
  | { mode: 'daily'; indexInFile: number; text: string; name: string; desc: string; type: string }
  | { mode: 'locations'; indexInFile: number; location: string; text: string; name: string; desc: string; type: string }
  | { mode: 'names'; name: string; desc: string; text: string };

export interface SearchResponse {
  lang: string;
  q: string;
  total: number;
  page: number;
  pageSize: number;
  items: SearchItem[];
  counts: { source: number; levels: number; daily: number; locations: number; names: number };
}

// Per-mode badge colors used in global search mode column.
export const MODE_COLORS: Record<Mode, { bg: string; text: string; label: string }> = {
  source:    { bg: '#f3f4f6', text: '#374151', label: 'Source' },
  levels:    { bg: '#dcfce7', text: '#166534', label: 'Level' },
  daily:     { bg: '#cffafe', text: '#155e75', label: 'Daily' },
  locations: { bg: '#fef3c7', text: '#92400e', label: 'Location' },
  names:     { bg: '#ede9fe', text: '#6d28d9', label: 'Name' },
};

export const TYPE_OPTIONS = ['quotes', 'poems', 'aphorisms', 'music', 'cinema', 'science'] as const;
export type QuoteType = (typeof TYPE_OPTIONS)[number];

// Per-type badge colors. Keys are QuoteType values; fallback is gray.
export const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  quotes:     { bg: '#dbeafe', text: '#1e40af' },
  poems:      { bg: '#ede9fe', text: '#6d28d9' },
  aphorisms:  { bg: '#dcfce7', text: '#166534' },
  music:      { bg: '#fce7f3', text: '#be185d' },
  cinema:     { bg: '#fef3c7', text: '#92400e' },
  science:    { bg: '#cffafe', text: '#155e75' },
};

// Fallback colors for unrecognized types
export const TYPE_COLORS_DEFAULT: { bg: string; text: string } = { bg: '#f3f4f6', text: '#374151' };

// ---------------------------------------------------------------------------
// Names (allNames.js) types
// ---------------------------------------------------------------------------

export interface NameItem {
  name: string;
  desc: string;
}

export interface NamesResponse {
  lang: string;
  mode: 'names';
  total: number;
  filtered: number;
  page: number;
  pageSize: number;
  items: NameItem[];
}

export interface NameDetail {
  lang: string;
  name: string;
  desc: string;
}

export interface NameMutationResponse {
  ok: true;
  lang: string;
  name: string;
  desc?: string;
}

export interface GenerateLevelsResponse {
  ok: true;
  lang: string;
  before: number;
  after: number;
  added: number;
  requested: number;
}

export interface LocationBucketTranslationsResponse {
  key: string;
  translations: Record<string, string>;
}

export interface CreateLocationBucketResponse {
  ok: true;
  lang: string;
  key: string;
  translations: Record<string, string>;
}
