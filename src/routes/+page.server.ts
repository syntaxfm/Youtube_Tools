import type { Actions } from './$types';

export const actions = {
	logout: async () => {
		return {
			status: 303,
			headers: {
				'Set-Cookie': 'code=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
			},
			location: '/'
		};
	}
} satisfies Actions;
