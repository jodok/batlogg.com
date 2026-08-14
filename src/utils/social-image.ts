import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import DefaultSocialImage from '../assets/social-card.png';
import type { SocialImagePosition } from './social-image-position';

export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;
const MIN_SOCIAL_IMAGE_WIDTH = 600;
const MIN_SOCIAL_IMAGE_HEIGHT = 315;
const warnedPositionFallbacks = new Set<string>();

export function hasSocialImageDimensions(image?: ImageMetadata): image is ImageMetadata {
  return Boolean(image && image.width >= MIN_SOCIAL_IMAGE_WIDTH && image.height >= MIN_SOCIAL_IMAGE_HEIGHT);
}

export function getSocialImageSource(image?: ImageMetadata) {
  return hasSocialImageDimensions(image) ? image : DefaultSocialImage;
}

export async function getSocialImage(image?: ImageMetadata, position?: SocialImagePosition) {
  const source = getSocialImageSource(image);
  const usesFallback = source !== image;

  if (position && usesFallback && !warnedPositionFallbacks.has(image?.src ?? 'default')) {
    warnedPositionFallbacks.add(image?.src ?? 'default');
    console.warn(`[social image] Ignoring socialImagePosition because the source is smaller than ${MIN_SOCIAL_IMAGE_WIDTH}×${MIN_SOCIAL_IMAGE_HEIGHT}.`);
  }

  return getImage({
    src: source,
    width: SOCIAL_IMAGE_WIDTH,
    height: SOCIAL_IMAGE_HEIGHT,
    format: 'jpg',
    fit: 'cover',
    position: usesFallback ? undefined : position,
    background: '#ffffff',
  });
}
