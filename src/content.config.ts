import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { SOCIAL_IMAGE_POSITIONS } from './utils/social-image-position';

const posts = defineCollection({
	// Load Markdown and MDX files anywhere in `src/content/`.
	loader: glob({ base: './src/content', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			subtitle: z.string().optional(),
			description: z.string(),
			categories: z.array(z.string()).optional(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			draft: z.boolean().default(false),
			heroImage: image().optional(),
			heroImageAlt: z.string().optional(),
			socialImagePosition: z.enum(SOCIAL_IMAGE_POSITIONS).optional(),
			heroImagePosition: z.string().optional(),
			coAuthors: z
				.array(
					z.object({
						name: z.string(),
						url: z.string().url(),
					}),
				)
				.optional(),
		}),
});

export const collections = { posts };
