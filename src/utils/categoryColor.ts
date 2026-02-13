const palette = [
  '#4E9A7A', // green
  '#587AE1', // blue
  '#E2BD38', // gold
  '#A964C9', // purple
  '#E06E4C', // coral
  '#3B9DB5', // teal
  '#C75B8E', // pink
  '#7B8F3A', // olive
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getCategoryColor(category: string): string {
  if (!category) return palette[0];
  return palette[hashString(category.toLowerCase()) % palette.length];
}
