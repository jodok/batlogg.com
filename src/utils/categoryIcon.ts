export type CategoryIconName = 'pencil' | 'code' | 'camera' | 'book' | 'briefcase';

type IconDefinition = {
  viewBox: string;
  paths: string[];
};

const ICONS: Record<CategoryIconName, IconDefinition> = {
  pencil: {
    viewBox: '0 0 24 24',
    paths: [
      'M16.862 4.487l1.688-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z',
      'M19.5 7.125L16.875 4.5',
    ],
  },
  code: {
    viewBox: '0 0 24 24',
    paths: ['M8.25 9l-3.75 3 3.75 3', 'M15.75 9l3.75 3-3.75 3', 'M13.5 6l-3 12'],
  },
  camera: {
    viewBox: '0 0 24 24',
    paths: [
      'M6.75 7.5h10.5a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 16.5V9.75A2.25 2.25 0 016.75 7.5z',
      'M9 7.5l1.125-1.5h3.75L15 7.5',
      'M12 15.75a3 3 0 100-6 3 3 0 000 6z',
    ],
  },
  book: {
    viewBox: '0 0 24 24',
    paths: [
      'M12 6.75c-1.864-1.243-4.25-1.243-6.75 0v10.5c2.5-1.243 4.886-1.243 6.75 0',
      'M12 6.75c1.864-1.243 4.25-1.243 6.75 0v10.5c-2.5-1.243-4.886-1.243-6.75 0',
      'M12 6.75v10.5',
    ],
  },
  briefcase: {
    viewBox: '0 0 24 24',
    paths: [
      'M9 6V4.875A1.875 1.875 0 0110.875 3h2.25A1.875 1.875 0 0115 4.875V6',
      'M9 6h6',
      'M6 8.25h12A2.25 2.25 0 0120.25 10.5v6A2.25 2.25 0 0118 18.75H6A2.25 2.25 0 013.75 16.5v-6A2.25 2.25 0 016 8.25z',
    ],
  },
};

// Configure category -> icon mapping here.
export const CATEGORY_ICON_MAP: Record<string, CategoryIconName> = {
  photography: 'camera',
  coding: 'code',
  python: 'code',
  books: 'book',
  reading: 'book',
  startup: 'briefcase',
  entrepreneurship: 'briefcase',
};

export function getCategoryIcon(category: string | undefined): IconDefinition {
  if (!category) return ICONS.pencil;
  const icon = CATEGORY_ICON_MAP[category.toLowerCase()] ?? 'pencil';
  return ICONS[icon];
}
