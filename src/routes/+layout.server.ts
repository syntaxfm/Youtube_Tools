import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const code = cookies.get('code');
	const isLoggedIn = !!code;

	return {
		isLoggedIn
	};
};
