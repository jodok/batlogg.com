// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Jodok Batlogg';
export const SITE_DESCRIPTION = 'Jodok Batlogg — serial entrepreneur and engineer based in Dornbirn, Austria. Thoughts on technology, climate, and entrepreneurship.';
export const SITE_URL = 'https://batlogg.com/';

export const ORGANIZATION_SCHEMA = {
	'@type': 'Organization',
	name: SITE_TITLE,
	description: 'The personal publishing and professional contact site of entrepreneur and engineer Jodok Batlogg.',
	url: SITE_URL,
	logo: `${SITE_URL}favicon.svg`,
	sameAs: [
		'https://github.com/jodok',
		'https://www.linkedin.com/in/jodok',
		'https://www.instagram.com/jodok',
		'https://x.com/jodok',
	],
	contactPoint: {
		'@type': 'ContactPoint',
		contactType: 'agent inquiries',
		email: 'tashi@namche.ai',
		telephone: '+43 677 64049410',
		availableLanguage: ['English', 'German'],
	},
	address: {
		'@type': 'PostalAddress',
		streetAddress: 'Sebastianstraße 6b',
		postalCode: '6850',
		addressLocality: 'Dornbirn',
		addressCountry: 'AT',
	},
} as const;
