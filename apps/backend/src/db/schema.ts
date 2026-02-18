import { create } from 'axios';
import { desc } from 'drizzle-orm';
import { pgTable, uuid, text, varchar, timestamp, unique, doublePrecision, boolean, integer } from 'drizzle-orm/pg-core';

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
  runtime: integer('runtime'),
  genres: text('genres'),

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
  watchedAt: timestamp('watched_at').defaultNow(),
});


//Watchlist is a default list for all users
export const lists = pgTable('lists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
});

export const listItems = pgTable('list_items', {
  id: uuid('uuid').primaryKey().defaultRandom(),
  listId: uuid('list_id').references(() => lists.id, { onDelete: 'cascade' }).notNull(),
  mediaId: uuid('media_id').references(() => media.id, { onDelete: 'cascade' }).notNull(),
});

export const userMediaCollections = pgTable('user_media_collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  mediaId: uuid('media_id').references(() => media.id).notNull(),
  status: varchar('status'),
  rating: doublePrecision('rating'),
  comment: text('comment'),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  unq: unique().on(t.userId, t.mediaId),
}));