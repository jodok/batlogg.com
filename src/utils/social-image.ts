import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import DefaultSocialImage from '../assets/social-card.png';

export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;

export function hasSocialImageDimensions(image?: ImageMetadata) {
  return Boolean(image && image.width >= SOCIAL_IMAGE_WIDTH && image.height >= SOCIAL_IMAGE_HEIGHT);
}

export function getSocialImageSource(image?: ImageMetadata) {
  return hasSocialImageDimensions(image) ? image : DefaultSocialImage;
}

export async function getSocialImage(image?: ImageMetadata, position?: string) {
  const source = getSocialImageSource(image);

  return getImage({
    src: source,
    width: SOCIAL_IMAGE_WIDTH,
    height: SOCIAL_IMAGE_HEIGHT,
    format: 'jpg',
    fit: 'cover',
    position: source === image ? position : undefined,
  });
}
