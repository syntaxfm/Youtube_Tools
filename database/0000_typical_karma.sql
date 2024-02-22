CREATE TABLE `youtube_videos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`channelTitle` text NOT NULL,
	`playlistId` text NOT NULL,
	`thumbnails` text NOT NULL
);
