import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { media, activityLogs, lists, listItems, } from '../db/schema';
import { addLogDTO } from './DTO/add_log.dto';
import { updateLogDTO } from './DTO/update_log.dto';
import { createListDTO } from './DTO/create_list.dto';
import { addMediaToListDTO } from './DTO/add_media_list.dto';
import { eq, desc, and } from 'drizzle-orm';
import { TmdbService } from './tmdb/tmdb.service';


@Injectable()
export class MediaService {
  constructor(private drizzle: DrizzleService, private tmdbService: TmdbService) {}


    //Core funcitons for Upserting media
    async checkMediaValidity(addMediaDto: addMediaToListDTO | addLogDTO) {
        //Currently only supports TMDB, need to be expanded to support RAWG and LASTFM in the future
        let title: string = addMediaDto.title;
        let posterUrl: string | null = addMediaDto.posterUrl || null;
        let runtime: number = addMediaDto.runtime;
        let genres: string = addMediaDto.genres;

        switch (addMediaDto.provider) {
            case 'TMDB':
                try {
                    const details = await this.tmdbService.getMovieDetails(addMediaDto.externalId);
                    title = details.title;
                    posterUrl = details.posterUrl;
                    runtime = details.runtime;
                    genres = details.genres;
                } catch (error) {
                    console.error('Error fetching media details from TMDB:', error);
                    throw new InternalServerErrorException('Failed to fetch media details from TMDB');
                }
                break;
            //Future cases for RAWG and LASTFM will go here
            default:
                throw new InternalServerErrorException('Unsupported media provider');
        }

        return { title, posterUrl, runtime, genres };
    }

    async UpsertMedia(logData: addLogDTO | addMediaToListDTO, validMedia: any) {
        const [Media] = await this.drizzle.db.insert(media)
                .values({
                    externalId: logData.externalId,
                    provider: logData.provider,
                    type: logData.type,
                    title: validMedia.title,
                    posterUrl: validMedia.posterUrl,
                    runtime: validMedia.runtime,
                    genres: validMedia.genres,
                })
                .onConflictDoUpdate({
                    target: [media.externalId, media.provider],
                    set: {
                        title: validMedia.title,
                        posterUrl: validMedia.posterUrl,
                        runtime: validMedia.runtime,
                        genres: validMedia.genres,
                    },
                })
                .returning();
        return Media;
    }

    //Activity Log Methods
    async addLog(userId: string, logData: addLogDTO) {
        try {
            const validMedia = await this.checkMediaValidity(logData);
            const Media = await this.UpsertMedia(logData, validMedia);
            const NewLog = await this.drizzle.db.insert(activityLogs)
                .values({
                    userId: userId,
                    mediaId: Media.id,
                    status: logData.status,
                    rewatched: logData.rewatched,
                    liked: logData.liked,
                    rating: logData.rating,
                    comment: logData.comment,
                })
                .returning();

            return {
                message: 'Log added successfully',
                log: NewLog,
                media: Media
            };
        } catch (error) {
            console.error('Error adding log:', error);
            throw new InternalServerErrorException('Failed to add log');
        }
    }

    async updateLog(userId: string, logId: string, logData: updateLogDTO) {
        const [UpdatedLog] = await this.drizzle.db.update(activityLogs)
            .set(logData)
            .where(and(
                eq(activityLogs.id, logId),
                eq(activityLogs.userId, userId)
            ))
            .returning();

        if (!UpdatedLog) {
            throw new InternalServerErrorException('Failed to update log or log not found');
        }

        return {
            message: 'Log updated successfully',
            log: UpdatedLog
        };
    }


    async deleteLog(userId: string, logId: string) {
        const [deletedlog] = await this.drizzle.db.delete(activityLogs)
            .where(and(
                eq(activityLogs.id, logId),
                eq(activityLogs.userId, userId)
            )).returning();

        if (!deletedlog) {
            throw new InternalServerErrorException('Failed to delete log or log not found');
        }

        return {
            message: 'Log deleted successfully',
        };
    }

    async getUserLogs(userId: string) {
        return this.drizzle.db.select(
            {
                id: activityLogs.id,
                status: activityLogs.status,
                rating: activityLogs.rating,
                comment: activityLogs.comment,
                rewatched: activityLogs.rewatched,
                liked: activityLogs.liked,
                createdAt: activityLogs.createdAt,
                
                mediaInfo: {
                    title: media.title,
                    posterUrl: media.posterUrl,
                    type: media.type,
                    provider: media.provider,
                    externalId: media.externalId,
                }
            })
            .from(activityLogs)
            .innerJoin(media, eq(activityLogs.mediaId, media.id))
            .where(eq(activityLogs.userId, userId))
            .orderBy(desc(activityLogs.createdAt));
            
    }

    //Methods for lists
    async createList(userId: string, listDto: createListDTO) {
        return this.drizzle.db.insert(lists)
            .values({
                userId: userId,
                name: listDto.name,
                description: listDto.description,
                isPublic: listDto.isPublic,
            })
            .returning();
    }

    async getUserLists(userId: string) {
        return this.drizzle.db.select(
            {
                id: lists.id,
                name: lists.name,
                description: lists.description,
                isPublic: lists.isPublic,
                createdAt: lists.createdAt,
            }
        )
            .from(lists)
            .where(eq(lists.userId, userId))
    }

    async addMediaToList(userId: string, listId: string, addMediaDto: addMediaToListDTO) {
        const validMedia = await this.checkMediaValidity(addMediaDto);
        const Media = await this.UpsertMedia(addMediaDto, validMedia);

        const [ListItem] = await this.drizzle.db.insert(listItems)
            .values({
                listId: listId,
                mediaId: Media.id,
            })
            .returning();

        return {
            message: 'Media added to list successfully',
            listItem: ListItem,
            media: Media
        };
    }

    async getListItems(userId: string, listId: string) {
        return this.drizzle.db.select(
            {
                ListItemid: listItems.id,
                mediaInfo: {
                    id: media.id,
                    title: media.title,
                    posterUrl: media.posterUrl,
                    type: media.type,
                    externalId: media.externalId,
                }
            }).from(listItems)
            .innerJoin(media, eq(listItems.mediaId, media.id))
            .innerJoin(lists, eq(listItems.listId, lists.id))
            .where(and(eq(lists.userId, userId), eq(lists.id, listId)));
        }

    async removeMediaFromList(userId: string, listId: string, mediaId: string) {
        return this.drizzle.db.delete(listItems)
        .where(and(
            eq(listItems.mediaId, mediaId),
            eq(listItems.listId, listId)
        )).returning();
    }

    async deleteList(userId: string, listId: string) {
        const [deletedList] = await this.drizzle.db.delete(lists)
            .where(and(
                eq(lists.id, listId),
                eq(lists.userId, userId)
            )).returning();

        if (!deletedList) {
            throw new InternalServerErrorException('Failed to delete list or list not found');
        }
        
        return {message: 'List deleted successfully'};
    }


}
