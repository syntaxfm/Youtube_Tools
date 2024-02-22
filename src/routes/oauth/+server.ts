import { error } from '@sveltejs/kit';
import { GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_GOOGLE_CLIENT_ID, PUBLIC_GOOGLE_REDIRECT } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { google } from 'googleapis';

const cookie_options = {
	httpOnly: true,
	path: '/',
	sameSite: 'Lax',
	maxAge: 60 * 60 * 24 * 365 // 1 year
} as const;

export async function GET({ url, cookies }) {
	try {
		const code = url.searchParams.get('code');
		const oauth2Client = new google.auth.OAuth2(
			PUBLIC_GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET,
			PUBLIC_GOOGLE_REDIRECT
		);
		const { tokens } = await oauth2Client.getToken(code);
		const token = tokens.access_token;

		if (token) {
			cookies.set('code', token, cookie_options);
		}
	} catch (e) {
		console.log(e);
		throw error(500, 'Login Failed');
	}
	redirect(302, '/tools');
}
