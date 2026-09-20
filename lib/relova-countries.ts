// Countries that have a full relocation guide on relova.ai (visas, tax,
// cost of living, checklist). Used to link salary pages to the matching
// relova.ai/countries/<slug> guide instead of just the generic homepage,
// when one actually exists — a dead link is worse than no link.
//
// Keep in sync with relova.ai's src/data/countries.ts. relova.ai uses a few
// short codes (uae, uk, usa) instead of full names, hence the overrides.
const RELOVA_COUNTRY_SLUGS = new Set([
  "albania", "argentina", "armenia", "australia", "austria", "belgium",
  "brazil", "bulgaria", "canada", "chile", "colombia", "costa-rica",
  "croatia", "cyprus", "czech-republic", "denmark", "ecuador", "estonia",
  "finland", "france", "georgia", "germany", "greece", "hungary",
  "indonesia", "ireland", "italy", "japan", "latvia", "lithuania",
  "malaysia", "malta", "mexico", "montenegro", "morocco", "netherlands",
  "new-zealand", "norway", "panama", "paraguay", "peru", "philippines",
  "poland", "portugal", "puerto-rico", "qatar", "romania", "serbia",
  "singapore", "slovakia", "slovenia", "south-africa", "south-korea",
  "spain", "sweden", "switzerland", "thailand", "turkey", "uae", "uk",
  "uruguay", "usa", "vietnam",
]);

// Country names this site spells differently than relova.ai's short slugs.
const SLUG_OVERRIDES: Record<string, string> = {
  "united-arab-emirates": "uae",
  "united-kingdom": "uk",
  "united-states": "usa",
};

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Returns the relova.ai country-guide slug for a given country name, or
// undefined if relova.ai doesn't have a guide for it yet.
export function relovaCountrySlug(countryName: string): string | undefined {
  const slug = SLUG_OVERRIDES[toSlug(countryName)] ?? toSlug(countryName);
  return RELOVA_COUNTRY_SLUGS.has(slug) ? slug : undefined;
}
