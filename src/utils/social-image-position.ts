export const SOCIAL_IMAGE_POSITIONS = [
  'attention',
  'entropy',
  'centre',
  'north',
  'northeast',
  'east',
  'southeast',
  'south',
  'southwest',
  'west',
  'northwest',
] as const;

export type SocialImagePosition = (typeof SOCIAL_IMAGE_POSITIONS)[number];
