export const ENTRIES_PER_PAGE = 25;

export type PageNavItem =
  | { kind: "page"; page: number }
  | { kind: "ellipsis" };

/** Page numbers with gaps for large page counts (Prev / 1 … 5 6 7 … 20 / Next). */
export function getPageNavItems(current: number, total: number): PageNavItem[] {
  if (total <= 1) return [{ kind: "page", page: 1 }];
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => ({
      kind: "page" as const,
      page: i + 1,
    }));
  }

  const items: PageNavItem[] = [];
  const window = 1;
  const left = Math.max(2, current - window);
  const right = Math.min(total - 1, current + window);

  items.push({ kind: "page", page: 1 });

  if (left > 2) items.push({ kind: "ellipsis" });

  for (let p = left; p <= right; p++) {
    items.push({ kind: "page", page: p });
  }

  if (right < total - 1) items.push({ kind: "ellipsis" });

  items.push({ kind: "page", page: total });
  return items;
}
