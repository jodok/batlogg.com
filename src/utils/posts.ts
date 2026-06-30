import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export function isPublishedPost(post: Post) {
	return post.data.draft !== true;
}

export function sortPostsByDate(posts: Post[]) {
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getPostCategories(posts: Post[]) {
	const categoryCounts = new Map<string, number>();

	for (const post of posts) {
		for (const category of post.data.categories ?? []) {
			categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
		}
	}

	return [...categoryCounts.entries()]
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getPublishedPosts() {
	const posts = await getCollection('posts', ({ data }) => data.draft !== true);
	return sortPostsByDate(posts);
}

export async function getRoutablePosts() {
	const posts = await getCollection('posts');
	return import.meta.env.DEV ? posts : posts.filter(isPublishedPost);
}
