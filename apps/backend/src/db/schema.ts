import { pgTable, uuid, text, varchar, timestamp, unique, doublePrecision, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  externalId: varchar('external_id').notNull(), // ID OMDb ou RAWG
  provider: varchar('provider').notNull(),    // 'OMDB', 'RAWG', 'LASTFM'
  type: varchar('type').notNull(),            // 'MOVIE', 'GAME', 'ALBUM, SHOW, MUSIC'
  title: text('title').notNull(),
  posterUrl: text('poster_url'),
}, (t) => ({
  unq: unique().on(t.externalId, t.provider),
}));

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  mediaId: uuid('media_id').references(() => media.id).notNull(),
  status: varchar('status'),
  rating: doublePrecision('rating'),
  comment: text('comment'),
  rewatched: boolean('rewatched'),
  liked: boolean('liked'),
  createdAt: timestamp('created_at').defaultNow(),
});