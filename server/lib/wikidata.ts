export type WikidataSearchResult = {
  id: string;
  label: string;
  description?: string;
};

const WIKIDATA_ENDPOINT = "https://www.wikidata.org/w/api.php";
const MAX_DOMAIN_LENGTH = 24;

function normalizeDomain(value: string) {
  return value.trim().toLowerCase();
}

export function isShortSingleWordDomain(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.length > MAX_DOMAIN_LENGTH) return false;
  return !/\s/.test(trimmed);
}

export async function searchWikidataDomains(query: string, limit = 8) {
  const trimmed = query.trim();
  if (!trimmed) return [] as WikidataSearchResult[];

  const url = new URL(WIKIDATA_ENDPOINT);
  url.searchParams.set("action", "wbsearchentities");
  url.searchParams.set("search", trimmed);
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "KnowledgeEquity/1.0 (domain lookup)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Wikidata lookup failed (${response.status})`);
  }

  const payload = (await response.json()) as any;
  const results = Array.isArray(payload?.search) ? payload.search : [];

  return results
    .map((item: any) => ({
      id: item.id as string,
      label: item.label as string,
      description: item.description as string | undefined,
    }))
    .filter(
      (item: WikidataSearchResult) =>
        item.label && isShortSingleWordDomain(item.label),
    );
}

export async function validateWikidataDomain(domain: string) {
  const normalized = normalizeDomain(domain);
  if (!normalized) {
    return { valid: false, matches: [] as WikidataSearchResult[] };
  }

  if (!isShortSingleWordDomain(domain)) {
    return { valid: false, matches: [] as WikidataSearchResult[] };
  }

  const results = await searchWikidataDomains(domain, 10);
  const exact = results.find(
    (item) => normalizeDomain(item.label) === normalized,
  );

  return {
    valid: Boolean(exact),
    matches: results,
    exact: exact ?? null,
  };
}
