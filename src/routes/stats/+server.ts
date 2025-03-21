// src/routes/api/batch-analyze/+server.js
import { json } from '@sveltejs/kit';
import { google } from 'googleapis';
import { GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_GOOGLE_CLIENT_ID, PUBLIC_GOOGLE_REDIRECT } from '$env/static/public';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	try {
		// Get the auth token from the httpOnly cookie
		const accessToken = cookies.get('access_token');
		const refreshToken = cookies.get('refresh_token');

		console.log('Auth Debug:', {
			hasAccessToken: !!accessToken,
			hasRefreshToken: !!refreshToken,
			tokenLength: accessToken?.length,
			cookieKeys: cookies.getAll().map((c) => c.name)
		});

		if (!accessToken) {
			return new Response(JSON.stringify({ error: 'Not authenticated' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Set up OAuth client
		const oauth2Client = new google.auth.OAuth2(
			PUBLIC_GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET,
			PUBLIC_GOOGLE_REDIRECT
		);

		// Set the credentials
		oauth2Client.setCredentials({
			access_token: accessToken,
			refresh_token: refreshToken
		});

		// Parse the incoming request body
		const { playlistIds } = await request.json();

		if (!Array.isArray(playlistIds) || playlistIds.length === 0) {
			return new Response(JSON.stringify({ error: 'Invalid or empty playlist IDs array' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Analyze each playlist
		const results = await Promise.all(
			playlistIds.map(async (playlistId) => {
				try {
					// Get a fresh access token if needed
					const { token } = await oauth2Client.getAccessToken();
					if (token) {
						cookies.set('access_token', token, {
							httpOnly: true,
							path: '/',
							sameSite: 'lax',
							maxAge: 60 * 60 // 1 hour
						});
					}
					return await analyzePlaylist(playlistId, token || accessToken);
				} catch (error) {
					console.error(`Error analyzing playlist ${playlistId}:`, error);
					return {
						playlistId,
						error: error instanceof Error ? error.message : 'Unknown error',
						isError: true
					};
				}
			})
		);

		// Sort results by total views (descending), placing errors at the end
		results.sort((a, b) => {
			if (a.isError && !b.isError) return 1;
			if (!a.isError && b.isError) return -1;
			if (a.isError && b.isError) return 0;
			return (b.totalViews || 0) - (a.totalViews || 0);
		});

		return json(results);
	} catch (error) {
		console.error('Error in batch analyze:', error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}

/**
 * Analyze a single playlist
 * @param {string} playlistId - YouTube playlist ID
 * @param {string} authToken - OAuth token
 * @returns {Promise<Object>} - Playlist analytics
 */
async function analyzePlaylist(playlistId, authToken) {
	// Debug token format
	console.log('Token debug:', {
		length: authToken.length,
		prefix: authToken.substring(0, 10) + '...',
		suffix: '...' + authToken.substring(authToken.length - 10)
	});

	// Ensure token doesn't have any whitespace
	const cleanToken = authToken.trim();

	// Step 1: Get playlist details
	const playlistResponse = await fetch(
		`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}`,
		{
			headers: {
				Authorization: `Bearer ${cleanToken}`,
				'Content-Type': 'application/json'
			}
		}
	);

	if (!playlistResponse.ok) {
		const errorData = await playlistResponse.json();
		console.error('YouTube API Error Details:', {
			status: playlistResponse.status,
			statusText: playlistResponse.statusText,
			headers: Object.fromEntries(playlistResponse.headers.entries()),
			error: errorData,
			requestUrl: playlistResponse.url,
			requestHeaders: {
				Authorization: `Bearer ${cleanToken.substring(0, 10)}...${cleanToken.substring(cleanToken.length - 10)}`
			}
		});
		throw new Error(
			`YouTube API error: ${errorData.error?.message || playlistResponse.statusText}`
		);
	}

	const playlistData = await playlistResponse.json();

	if (!playlistData.items || playlistData.items.length === 0) {
		throw new Error(`Playlist not found: ${playlistId}`);
	}

	const playlistDetails = playlistData.items[0];
	const playlistTitle = playlistDetails.snippet.title;
	const thumbnailUrl = playlistDetails.snippet.thumbnails?.medium?.url || null;

	// Step 2: Get all videos in the playlist (handling pagination)
	let allPlaylistItems = [];
	let nextPageToken = null;

	do {
		const pageQueryParams = nextPageToken ? `&pageToken=${nextPageToken}` : '';
		const playlistItemsResponse = await fetch(
			`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}${pageQueryParams}`,
			{
				headers: {
					Authorization: `Bearer ${cleanToken}`,
					'Content-Type': 'application/json'
				}
			}
		);

		if (!playlistItemsResponse.ok) {
			const errorData = await playlistItemsResponse.json();
			throw new Error(
				`YouTube API error: ${errorData.error?.message || playlistItemsResponse.statusText}`
			);
		}

		const pageData = await playlistItemsResponse.json();
		allPlaylistItems = [...allPlaylistItems, ...pageData.items];
		nextPageToken = pageData.nextPageToken;
	} while (nextPageToken);

	// Get all video IDs
	const videoIds = allPlaylistItems.map((item) => item.snippet.resourceId.videoId).filter(Boolean);

	if (videoIds.length === 0) {
		return {
			playlistId,
			playlistTitle,
			thumbnailUrl,
			totalVideos: 0,
			totalViews: 0,
			avgViews: 0,
			totalLikes: 0,
			avgLikes: 0,
			totalComments: 0,
			avgComments: 0,
			totalDuration: '0h 0m 0s',
			avgDuration: '0h 0m 0s',
			engagementRate: '0%'
		};
	}

	// Step 3: Get video statistics and duration (in batches of 50)
	const videosBatchSize = 50;
	let allVideoData = [];

	for (let i = 0; i < videoIds.length; i += videosBatchSize) {
		const batchIds = videoIds.slice(i, i + videosBatchSize).join(',');

		const videoResponse = await fetch(
			`https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${batchIds}`,
			{
				headers: {
					Authorization: `Bearer ${cleanToken}`,
					'Content-Type': 'application/json'
				}
			}
		);

		if (!videoResponse.ok) {
			const errorData = await videoResponse.json();
			throw new Error(`YouTube API error: ${errorData.error?.message || videoResponse.statusText}`);
		}

		const batchData = await videoResponse.json();
		allVideoData = [...allVideoData, ...(batchData.items || [])];
	}

	// Step 4: Calculate metrics
	const totalVideos = allPlaylistItems.length;
	let totalViews = 0;
	let totalLikes = 0;
	let totalComments = 0;
	let totalDurationSeconds = 0;
	let videoProcessedCount = 0;

	// Arrays to store values for median calculations
	const viewCounts = [];
	const durationSeconds = [];

	allVideoData.forEach((video) => {
		if (video.statistics) {
			const views = parseInt(video.statistics.viewCount || 0);
			const likes = parseInt(video.statistics.likeCount || 0);
			const comments = parseInt(video.statistics.commentCount || 0);

			totalViews += views;
			totalLikes += likes;
			totalComments += comments;
			viewCounts.push(views);
			videoProcessedCount++;
		}

		if (video.contentDetails && video.contentDetails.duration) {
			// Parse duration from ISO 8601 format (PT1H2M3S)
			const duration = video.contentDetails.duration;
			const hourMatch = duration.match(/(\d+)H/);
			const minuteMatch = duration.match(/(\d+)M/);
			const secondMatch = duration.match(/(\d+)S/);

			const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
			const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
			const seconds = secondMatch ? parseInt(secondMatch[1]) : 0;

			const videoDurationSeconds = hours * 3600 + minutes * 60 + seconds;
			totalDurationSeconds += videoDurationSeconds;
			durationSeconds.push(videoDurationSeconds);
		}
	});

	// Sort arrays for median and top calculations
	viewCounts.sort((a, b) => a - b);
	durationSeconds.sort((a, b) => a - b);

	// Calculate mean with standard deviation cutoff
	function calculateMeanWithSDCutoff(values, sdMultiplier = 2) {
		if (values.length === 0) return 0;

		// Calculate mean
		const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

		// Calculate standard deviation
		const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
		const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
		const sd = Math.sqrt(variance);

		// Filter values within standard deviation range
		const filteredValues = values.filter((val) => Math.abs(val - mean) <= sdMultiplier * sd);

		// Calculate mean of filtered values
		return filteredValues.reduce((sum, val) => sum + val, 0) / filteredValues.length;
	}

	// Calculate medians
	const medianViews = viewCounts.length > 0 ? viewCounts[Math.floor(viewCounts.length / 2)] : 0;

	const medianDurationSeconds =
		durationSeconds.length > 0 ? durationSeconds[Math.floor(durationSeconds.length / 2)] : 0;

	// Calculate top video views and top 3 average
	const topVideoViews = viewCounts.length > 0 ? viewCounts[viewCounts.length - 1] : 0;
	const top3AvgViews =
		viewCounts.length >= 3
			? viewCounts.slice(-3).reduce((sum, views) => sum + views, 0) / 3
			: viewCounts.length > 0
				? viewCounts.reduce((sum, views) => sum + views, 0) / viewCounts.length
				: 0;

	// Calculate mean with standard deviation cutoff
	const meanViewsWithSD = calculateMeanWithSDCutoff(viewCounts);

	// Calculate averages
	const avgViews = videoProcessedCount > 0 ? totalViews / videoProcessedCount : 0;
	const avgLikes = videoProcessedCount > 0 ? totalLikes / videoProcessedCount : 0;
	const avgComments = videoProcessedCount > 0 ? totalComments / videoProcessedCount : 0;
	const avgDurationSeconds =
		durationSeconds.length > 0
			? durationSeconds.reduce((sum, duration) => sum + duration, 0) / durationSeconds.length
			: 0;

	// Format durations
	const formatDuration = (seconds) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = Math.floor(seconds % 60);

		const parts = [];
		if (hours > 0) parts.push(`${hours}h`);
		if (minutes > 0) parts.push(`${minutes}m`);
		if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

		return parts.join(' ') || '0s';
	};

	return {
		playlistId,
		playlistTitle,
		thumbnailUrl,
		totalVideos,
		totalViews,
		avgViews,
		medianViews,
		meanViewsWithSD,
		topVideoViews,
		top3AvgViews,
		totalLikes,
		avgLikes,
		totalComments,
		avgComments,
		totalDuration: formatDuration(totalDurationSeconds),
		avgDuration: formatDuration(avgDurationSeconds),
		medianDuration: formatDuration(medianDurationSeconds),
		engagementRate: `${(((totalLikes + totalComments) / totalViews) * 100).toFixed(2)}%`
	};
}
