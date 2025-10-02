/**
 * Category color utilities for consistent color assignment across Requirements components
 * Colors are assigned deterministically based on category name hash
 */

const CATEGORY_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-red-100 text-red-800 border-red-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-lime-100 text-lime-800 border-lime-200',
  'bg-sky-100 text-sky-800 border-sky-200',
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  'bg-slate-100 text-slate-800 border-slate-200',
  'bg-stone-100 text-stone-800 border-stone-200',
  'bg-zinc-100 text-zinc-800 border-zinc-200',
  'bg-neutral-100 text-neutral-800 border-neutral-200'
] as const;

/**
 * Generates a simple hash from a string
 * @param str - String to hash
 * @returns Hash number
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Gets consistent color classes for a category name
 * @param categoryName - Category name to get color for
 * @returns Tailwind color classes string
 */
export function getCategoryColor(categoryName: string): string {
  const hash = hashString(categoryName);
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}

/**
 * Gets all available category colors
 * @returns Array of color class strings
 */
export function getAllCategoryColors(): readonly string[] {
  return CATEGORY_COLORS;
}
