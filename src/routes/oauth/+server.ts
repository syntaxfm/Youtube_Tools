import { error } from '@sveltejs/kit';
import { GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_GOOGLE_CLIENT_ID, PUBLIC_GOOGLE_REDIRECT } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { google } from 'googleapis';

const cookie_options = {
	httpOnly: true,
	path: '/',
	sameSite: 'Lax',
	// Set to 1 hour since that's typically how long access tokens last
	maxAge: 60 * 60
} as const;

const refresh_token_cookie_options = {
	httpOnly: true,
	path: '/',
	sameSite: 'Lax',
	// Refresh tokens last much longer
	maxAge: 60 * 60 * 24 * 365
} as const;

export async function GET({ url, cookies }) {
	try {
		const code = url.searchParams.get('code');
		const oauth2Client = new google.auth.OAuth2(
			PUBLIC_GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET,
			PUBLIC_GOOGLE_REDIRECT
		);

		// Set up the correct scopes
		oauth2Client.setCredentials({
			scope: ['https://www.googleapis.com/auth/youtube.readonly']
		});

		const { tokens } = await oauth2Client.getToken(code);
		console.log('Received tokens:', {
			hasAccessToken: !!tokens.access_token,
			hasRefreshToken: !!tokens.refresh_token,
			expiryDate: tokens.expiry_date
		});

		if (tokens.access_token) {
			// Store access token in a cookie named 'access_token'
			cookies.set('access_token', tokens.access_token, cookie_options);

			// If we got a refresh token, store it for later
			if (tokens.refresh_token) {
				cookies.set('refresh_token', tokens.refresh_token, refresh_token_cookie_options);
			}
		} else {
			throw error(500, 'No access token received');
		}
	} catch (e) {
		console.error('OAuth error:', e);
		throw error(500, 'Login Failed');
	}
	throw redirect(302, '/tools');
}
