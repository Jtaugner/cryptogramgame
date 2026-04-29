// Typed wrapper around fetch('/api/...'). All functions throw on non-OK
// responses; the thrown value is the { error: string } body if available.
import type {
  Mode,
  LevelsSort,
  QuotesResponse,
  QuoteDetail,
  DailyDetail,
  LocationDetail,
  LocationDescriptor,
  LocationMutationResponse,
  PutResponse,
  PostResponse,
  DeleteResponse,
  DailyMutationResponse,
  NamesResponse,
  NameDetail,
  NameMutationResponse,
  ErrorResponse,
  SearchResponse,
  GenerateLevelsResponse,
  LocationBucketTranslationsResponse,
  CreateLocationBucketResponse,
} from './types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>;
  }
  let body: ErrorResponse;
  try {
    body = await res.json();
  } catch {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  throw new Error(body.error ?? `HTTP ${res.status}`);
}

export async function fetchLanguages(signal?: AbortSignal): Promise<string[]> {
  const res = await fetch('/api/languages', { signal });
  const data = await handleResponse<{ languages: string[] }>(res);
  return data.languages;
}

export async function fetchLocations(lang: string, signal?: AbortSignal): Promise<LocationDescriptor[]> {
  const qs = new URLSearchParams({ lang });
  const res = await fetch(`/api/locations?${qs}`, { signal });
  const data = await handleResponse<{ lang: string; locations: LocationDescriptor[] }>(res);
  return data.locations;
}

export interface FetchQuotesParams {
  lang: string;
  search: string;
  type: string;
  page: number;
  pageSize: number;
  mode: Mode;
  location?: string;
  sort?: LevelsSort;
  signal?: AbortSignal;
}

export async function fetchQuotes(params: FetchQuotesParams): Promise<QuotesResponse> {
  const { lang, search, type, page, pageSize, mode, location, sort, signal } = params;
  const qs = new URLSearchParams({
    lang,
    search,
    type,
    page: String(page),
    pageSize: String(pageSize),
    mode,
  });
  if (location) {
    qs.set('location', location);
  }
  if (sort) {
    qs.set('sort', sort);
  }
  const res = await fetch(`/api/quotes?${qs}`, { signal });
  return handleResponse<QuotesResponse>(res);
}

export async function fetchQuote(
  lang: string,
  source: string,
  index: number,
  signal?: AbortSignal,
): Promise<QuoteDetail> {
  const res = await fetch(`/api/quote/${encodeURIComponent(lang)}/${encodeURIComponent(source)}/${index}`, { signal });
  return handleResponse<QuoteDetail>(res);
}

export interface QuoteBody {
  text: string;
  name: string;
  desc?: string;
  type: string;
}

export async function putQuote(
  lang: string,
  source: string,
  index: number,
  body: QuoteBody,
): Promise<PutResponse> {
  const res = await fetch(
    `/api/quote/${encodeURIComponent(lang)}/${encodeURIComponent(source)}/${index}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  return handleResponse<PutResponse>(res);
}

export async function postQuote(lang: string, body: QuoteBody): Promise<PostResponse> {
  const res = await fetch(`/api/quote/${encodeURIComponent(lang)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<PostResponse>(res);
}

export async function deleteQuote(
  lang: string,
  source: string,
  index: number,
): Promise<DeleteResponse> {
  const res = await fetch(
    `/api/quote/${encodeURIComponent(lang)}/${encodeURIComponent(source)}/${index}`,
    { method: 'DELETE' },
  );
  return handleResponse<DeleteResponse>(res);
}

// ---------------------------------------------------------------------------
// Daily endpoints
// ---------------------------------------------------------------------------

export async function fetchDaily(
  lang: string,
  index: number,
  signal?: AbortSignal,
): Promise<DailyDetail> {
  const res = await fetch(`/api/daily/${encodeURIComponent(lang)}/${index}`, { signal });
  return handleResponse<DailyDetail>(res);
}

export async function putDaily(
  lang: string,
  index: number,
  text: string,
): Promise<DailyMutationResponse> {
  const res = await fetch(`/api/daily/${encodeURIComponent(lang)}/${index}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return handleResponse<DailyMutationResponse>(res);
}

export async function postDaily(lang: string, text: string): Promise<DailyMutationResponse> {
  const res = await fetch(`/api/daily/${encodeURIComponent(lang)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return handleResponse<DailyMutationResponse>(res);
}

export async function deleteDaily(lang: string, index: number): Promise<DailyMutationResponse> {
  const res = await fetch(`/api/daily/${encodeURIComponent(lang)}/${index}`, { method: 'DELETE' });
  return handleResponse<DailyMutationResponse>(res);
}

// ---------------------------------------------------------------------------
// Location endpoints
// ---------------------------------------------------------------------------

export async function fetchLocation(
  lang: string,
  key: string,
  index: number,
  signal?: AbortSignal,
): Promise<LocationDetail> {
  const res = await fetch(
    `/api/location/${encodeURIComponent(lang)}/${encodeURIComponent(key)}/${index}`,
    { signal },
  );
  return handleResponse<LocationDetail>(res);
}

export interface LocationBody {
  text: string;
  name: string;
  desc?: string;
  type: string;
}

export async function putLocation(
  lang: string,
  key: string,
  index: number,
  body: LocationBody,
): Promise<LocationMutationResponse> {
  const res = await fetch(
    `/api/location/${encodeURIComponent(lang)}/${encodeURIComponent(key)}/${index}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  return handleResponse<LocationMutationResponse>(res);
}

export async function postLocation(
  lang: string,
  key: string,
  body: LocationBody,
): Promise<LocationMutationResponse> {
  const res = await fetch(
    `/api/location/${encodeURIComponent(lang)}/${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  return handleResponse<LocationMutationResponse>(res);
}

export async function deleteLocation(
  lang: string,
  key: string,
  index: number,
): Promise<LocationMutationResponse> {
  const res = await fetch(
    `/api/location/${encodeURIComponent(lang)}/${encodeURIComponent(key)}/${index}`,
    { method: 'DELETE' },
  );
  return handleResponse<LocationMutationResponse>(res);
}

// ---------------------------------------------------------------------------
// Names endpoints (allNames.js)
// ---------------------------------------------------------------------------

export async function fetchNames(
  lang: string,
  search: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<NamesResponse> {
  const qs = new URLSearchParams({
    lang,
    search,
    page: String(page),
    pageSize: String(pageSize),
  });
  const res = await fetch(`/api/names?${qs}`, { signal });
  return handleResponse<NamesResponse>(res);
}

export async function fetchName(
  lang: string,
  name: string,
  signal?: AbortSignal,
): Promise<NameDetail> {
  const res = await fetch(`/api/name/${encodeURIComponent(lang)}/${encodeURIComponent(name)}`, { signal });
  return handleResponse<NameDetail>(res);
}

export async function putName(
  lang: string,
  name: string,
  body: { desc: string },
): Promise<NameMutationResponse> {
  const res = await fetch(
    `/api/name/${encodeURIComponent(lang)}/${encodeURIComponent(name)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  return handleResponse<NameMutationResponse>(res);
}

export async function postName(
  lang: string,
  body: { name: string; desc: string },
): Promise<NameMutationResponse> {
  const res = await fetch(`/api/name/${encodeURIComponent(lang)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<NameMutationResponse>(res);
}

export async function deleteName(
  lang: string,
  name: string,
): Promise<NameMutationResponse> {
  const res = await fetch(
    `/api/name/${encodeURIComponent(lang)}/${encodeURIComponent(name)}`,
    { method: 'DELETE' },
  );
  return handleResponse<NameMutationResponse>(res);
}

// ---------------------------------------------------------------------------
// Generate levels endpoint
// ---------------------------------------------------------------------------

export async function generateLevels(lang: string, count: number, signal?: AbortSignal): Promise<GenerateLevelsResponse> {
  const res = await fetch(`/api/generate-levels?lang=${encodeURIComponent(lang)}&count=${count}`, {
    method: 'POST',
    signal,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Global search endpoint
// ---------------------------------------------------------------------------

export async function searchAll(
  lang: string,
  q: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const qs = new URLSearchParams({
    lang,
    q,
    page: String(page),
    pageSize: String(pageSize),
  });
  const res = await fetch(`/api/search?${qs}`, { signal });
  return handleResponse<SearchResponse>(res);
}

// ---------------------------------------------------------------------------
// Location bucket endpoints
// ---------------------------------------------------------------------------

export async function fetchLocationBucketTranslations(
  key: string,
  signal?: AbortSignal,
): Promise<LocationBucketTranslationsResponse> {
  const qs = new URLSearchParams({ key });
  const res = await fetch(`/api/location-bucket/translations?${qs}`, { signal });
  return handleResponse<LocationBucketTranslationsResponse>(res);
}

export async function createLocationBucket(body: {
  lang: string;
  key: string;
  translations: Record<string, string>;
}): Promise<CreateLocationBucketResponse> {
  const res = await fetch('/api/location-bucket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<CreateLocationBucketResponse>(res);
}
