import { google } from 'googleapis';
import { db } from '../../data/init';
import { youtube_videos } from '../../data/schema';
import { sql } from 'drizzle-orm';

export const load = async () => {
	const data = await db.query.youtube_videos.findMany();
	return { videos: data };
};

export const actions = {
	async import({ cookies }) {
		const code = cookies.get('code');
		await getChannelVideos(code);
	},
	async find({ request }) {
		const data = await request.formData();

		const searchString = data.get('find');
		const result = await db
			.select()
			.from(youtube_videos)
			.where(sql`${youtube_videos.description} LIKE ${'%' + searchString + '%'}`);
		return { result };
	}
};

async function getChannelVideos(accessToken: string) {
	// Auth client
	const oauth2Client = new google.auth.OAuth2();
	oauth2Client.setCredentials({ access_token: accessToken });

	// Google YouTube API client
	const youtube = google.youtube({
		version: 'v3',
		auth: oauth2Client
	});

	try {
		// Get the authenticated user's channel ID
		const channelResponse = await youtube.channels.list({
			mine: true,
			part: 'contentDetails'
		});
		const channelId = channelResponse.data.items[0].id;
		const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

		// Function to recursively fetch all videos from the uploads playlist
		async function fetchPlaylistItems(playlistId: string, nextPageToken = '', videos = []) {
			try {
				const res = await youtube.playlistItems.list({
					playlistId: playlistId,
					part: 'snippet',
					maxResults: 50,
					pageToken: nextPageToken
				});

				videos.push(...res.data.items);

				if (res.data.nextPageToken) {
					await fetchPlaylistItems(playlistId, res.data.nextPageToken, videos);
				}

				return videos;
			} catch (e) {
				console.error('The API returned an error: ' + e);
				return [];
			}
		}

		// Fetch all videos from the channel's uploads playlist
		const videos = await fetchPlaylistItems(uploadsPlaylistId);
		console.log(`Found ${videos.length} videos in channel ${channelId}.`);

		// Output video titles and video IDs
		for (const video of videos) {
			try {
				await db
					.insert(youtube_videos)
					.values({
						id: video.id,
						title: video.snippet.title,
						description: video.snippet.description,
						channelTitle: video.snippet.channelTitle,
						playlistId: video.snippet.playlistId,
						thumbnails: JSON.stringify(video.snippet.thumbnails)
					})
					.onConflictDoNothing({ target: youtube_videos.id });
			} catch (error) {
				console.error('The DB returned an error: ' + error);
			}
		}
	} catch (error) {
		console.error('The API returned an error: ' + error);
	}
}
