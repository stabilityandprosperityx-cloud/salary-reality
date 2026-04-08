export const COUNTRIES = [
  "Albania",
  "Algeria",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Bolivia",
  "Bosnia",
  "Brazil",
  "Cambodia",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Czech Republic",
  "Denmark",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Ethiopia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Honduras",
  "Hungary",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Lebanon",
  "Libya",
  "Malaysia",
  "Mexico",
  "Netherlands",
  "Morocco",
  "Moldova",
  "Montenegro",
  "Myanmar",
  "Nepal",
  "New Zealand",
  "Nicaragua",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Rwanda",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Tanzania",
  "Thailand",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vietnam",
] as const;

export const PROFESSIONS = [
  "Software Engineering",
  "Design / UX",
  "Marketing / Growth",
  "Sales",
  "Finance / Accounting",
  "Legal",
  "Healthcare / Medical",
  "Education / Teaching",
  "Operations / Management",
  "Customer Support",
  "Data / Analytics",
  "Product Management",
  "Content / Writing",
  "Consulting",
  "Real Estate",
  "Construction / Engineering",
  "Hospitality / Tourism",
  "Other",
] as const;

const KNOWN_LABELS = [...COUNTRIES, ...PROFESSIONS] as const;
const SLUG_TO_LABEL = new Map(KNOWN_LABELS.map((label) => [toSlug(label), label]));

export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(input: string): string {
  return input
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Reverse of `toSlug` for known country/profession slugs, with graceful fallback. */
export function fromSlug(str: string): string {
  const known = SLUG_TO_LABEL.get(str);
  if (known) return known;
  return titleCase(str.replace(/-/g, " "));
}

