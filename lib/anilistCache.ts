const CACHE_KEY = "kizuna_covers_v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30;

interface CacheEntry {
  covers: Record<string, string>;
  fetchedAt: number;
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function writeCache(covers: Record<string, string>): void {
  try {
    const entry: CacheEntry = { covers, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently skip
  }
}

const ANILIST_QUERY = `
  query ($titles: [String]) {
    Page(perPage: 50) {
      media(search_in: $titles, type: MANGA, sort: POPULARITY_DESC) {
        title { romaji english }
        coverImage { extraLarge }
      }
    }
  }
`;

// AniList doesn't support batch search by title list in one query.
// We fire requests in parallel with a small concurrency cap to avoid
// hammering the API. All titles are deduplicated before fetching.
async function fetchSingle(title: string): Promise<{ title: string; url: string | null }> {
  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query($s:String){Page(perPage:1){media(search:$s,type:MANGA,sort:POPULARITY_DESC){title{romaji}coverImage{extraLarge}}}}`,
        variables: { s: title },
      }),
    });
    if (!res.ok) return { title, url: null };
    const data = await res.json();
    const url = data.data?.Page?.media?.[0]?.coverImage?.extraLarge ?? null;
    return { title, url };
  } catch {
    return { title, url: null };
  }
}

async function fetchWithConcurrency(
  titles: string[],
  concurrency = 4,
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  const queue = [...titles];

  async function worker() {
    while (queue.length > 0) {
      const title = queue.shift()!;
      const { url } = await fetchSingle(title);
      if (url) results[title] = url;
      // Small polite delay between each worker's requests
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * getCovers(titles)
 *
 * Returns a map of title → cover image URL.
 * - Checks localStorage cache first (10-minute TTL).
 * - On miss, fetches from AniList with capped concurrency.
 * - Missing titles (fetch failed) are simply absent from the map.
 * - Call this once per page; all three pages (landing, releases, chapter) use it.
 *
 * Usage:
 *   const covers = await getCovers(RELEASES.map(r => r.title));
 *   const src = covers[title]; // undefined if not found → use fallback
 */
export async function getCovers(
  titles: string[],
): Promise<Record<string, string>> {
  const unique = [...new Set(titles)];

  const cached = readCache();
  if (cached) {
    // Return cached, but check if any new titles need fetching
    const missing = unique.filter((t) => !(t in cached.covers));
    if (missing.length === 0) return cached.covers;

    // Fetch only the missing ones and merge
    const freshMissing = await fetchWithConcurrency(missing);
    const merged = { ...cached.covers, ...freshMissing };
    writeCache(merged);
    return merged;
  }

  const fresh = await fetchWithConcurrency(unique);
  writeCache(fresh);
  return fresh;
}

/**
 * invalidateCoversCache()
 * Call this on sign-out if you want a clean slate.
 */
export function invalidateCoversCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {}
}