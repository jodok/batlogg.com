import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export function isPublishedPost(post: Post) {
	return post.data.draft !== true;
}

export function sortPostsByDate(posts: Post[]) {
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPublishedPosts() {
	const posts = await getCollection('posts', ({ data }) => data.draft !== true);
	return sortPostsByDate(posts);
}

export async function getRoutablePosts() {
	const posts = await getCollection('posts');
	return import.meta.env.DEV ? posts : posts.filter(isPublishedPost);
}
