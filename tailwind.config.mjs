/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				brand: {
					green: '#4E9A7A',
					lime: '#7CC745',
					'lime-light': '#BEDA4D',
					blue: '#587AE1',
					gold: '#E2BD38',
					purple: '#A964C9',
					coral: '#E06E4C',
				},
			},
		},
	},
	plugins: [],
};
