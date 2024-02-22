import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const youtube_videos = sqliteTable("youtube_videos", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	channelTitle: text("channelTitle").notNull(),
	playlistId: text("playlistId").notNull(),
	thumbnails: text("thumbnails", { mode: "json" }).notNull(),
});
