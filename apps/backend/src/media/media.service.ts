import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { media, activityLogs, lists, listItems, userMediaCollections, seasons_tvshows } from '../db/schema';
import { addLogDTO } from './DTO/add_log.dto';
import { updateLogDTO } from './DTO/update_log.dto';
import { createListDTO } from './DTO/create_list.dto';
import { addMediaToListDTO } from './DTO/add_media_list.dto';
import { eq, desc, and, sql, is } from 'drizzle-orm';
import { TmdbService } from './tmdb/tmdb.service';



@Injectable()
export class MediaService {
  constructor(private drizzle: DrizzleService, private tmdbService: TmdbService) {}


    //Core funcitons for Upserting media
    async checkMediaValidity(addMediaDto: addMediaToListDTO | addLogDTO) {
        //Currently only supports TMDB, need to be expanded to support RAWG and LASTFM in the future
        let title: string;
        let posterUrl: string | null;
        let runtime: number;
        let genres: string;
        let rawSeasons: any[] = [];

        switch (addMediaDto.type) {
            case 'MOVIE':
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
            case 'SHOW':
            case 'TV_SHOW':
            try {
                const details = await this.tmdbService.getTVShowDetails(addMediaDto.externalId);
                title = details.title;
                posterUrl = details.posterUrl;
                genres = details.genres;
                runtime = 0;
                rawSeasons = (details as any).seasons || []; 
            } catch (error) {
                console.error('Error fetching TV show details from TMDB:', error);
                throw new InternalServerErrorException('Failed to fetch TV show details from TMDB');
            }
            break;
                    

                    
            //Future cases for RAWG and LASTFM will go here
            default:
                throw new InternalServerErrorException('Unsupported media provider');
        }

        return { title, posterUrl, runtime, genres, rawSeasons };
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
    async UpsertSeasons(mediaId: string, seasonsData: any[]) {
        if (!seasonsData || seasonsData.length === 0) return;

        const seasonsToInsert = seasonsData.map((s) => ({
            mediaId: mediaId,
            title: s.name || `Saison ${s.season_number}`,
            seasonNumber: s.season_number,
            episodes: s.episode_count || 0,
            posterUrl: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
        }));

        await this.drizzle.db.insert(seasons_tvshows)
            .values(seasonsToInsert)
            .onConflictDoUpdate({
                target: [seasons_tvshows.mediaId, seasons_tvshows.seasonNumber],
                set: {
                    episodes: sql`EXCLUDED.episodes`,
                    posterUrl: sql`EXCLUDED.poster_url`,
                    title: sql`EXCLUDED.title`,
                },
            });
}

    //Activity Log Methods
    async addLog(userId: string, logData: addLogDTO) {
        try {
            const validMedia = await this.checkMediaValidity(logData);
            const Media = await this.UpsertMedia(logData, validMedia);

    
            let targetSeasonUuid: string | null = null;

            if (logData.type === 'SHOW' || logData.type === 'TV_SHOW') {
                await this.UpsertSeasons(Media.id, (validMedia as any).rawSeasons);
                
                if (logData.seasonId !== undefined && logData.seasonId !== null) {
                    targetSeasonUuid = await this.getSeasonUuid(Media.id, logData.seasonId);
                }
            }


            const [existingEntry] = await this.drizzle.db.select()
            .from(userMediaCollections)
            .where(and(
                eq(userMediaCollections.userId, userId),
                eq(userMediaCollections.mediaId, Media.id),
                targetSeasonUuid ? eq(userMediaCollections.seasonId, targetSeasonUuid) : sql`${userMediaCollections.seasonId} IS NULL`
            ))
            .limit(1);

            const alreadyExists = existingEntry?.status === 'WATCHED' || existingEntry?.status === 'PLAYED' || existingEntry?.status === 'COMPLETED';

 
            const [NewLog] = await this.drizzle.db.insert(activityLogs)
                .values({
                    userId: userId,
                    mediaId: Media.id,
                    seasonId: targetSeasonUuid,
                    status: logData.status,
                    rewatched: alreadyExists ? true : logData.rewatched,
                    liked: logData.liked,
                    rating: logData.rating,
                    comment: logData.comment,
                    watchedAt: logData.watchedAt ? new Date(logData.watchedAt) : new Date(),
                })
                .returning();

            await this.drizzle.db.insert(userMediaCollections)
                .values({
                    userId: userId,
                    mediaId: Media.id,
                    seasonId: targetSeasonUuid,
                    status: logData.status,
                    rating: logData.rating,
                    comment: logData.comment,
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: [userMediaCollections.userId, userMediaCollections.mediaId, userMediaCollections.seasonId],
                    set: {
                        status: logData.status,
                        rating: logData.rating,
                        comment: logData.comment,
                        updatedAt: new Date(),
                    },
                }).returning();
            

            return {
                message: 'Log added successfully',
                log: NewLog,
                media: Media,
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
                watchedAt: activityLogs.watchedAt,
                
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
            .orderBy(desc(activityLogs.watchedAt));
            
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

    async getStatsByType(userId: string, mediaType: string) {
        const result = await this.drizzle.db.select({
            count: sql<number>`count(${activityLogs.id})`,
            avgRating: sql<number>`round(avg(${activityLogs.rating})::numeric, 1)`,
            totalRuntime: sql<number>`sum(${media.runtime})`,
        })
        .from(activityLogs)
        .innerJoin(media, eq(activityLogs.mediaId, media.id))
        .where(
            and(
            eq(activityLogs.userId, userId),
            eq(media.type, mediaType.toUpperCase())
            )
        );

        const stats = result[0];
        const totalMinutes = Number(stats.totalRuntime) || 0;

        return {
            type: mediaType.toUpperCase(),
            totalItems: Number(stats.count) || 0,
            averageRating: Number(stats.avgRating) || 0,
            timeSpent: {
            minutes: totalMinutes,
            hours: Math.floor(totalMinutes / 60),
            label: mediaType.toUpperCase() === 'GAME' ? 'jouées' : 'visionnées'
            }
        };
    } 

    //Collecton methods
    async UpdateCollectionStatus(userId: string, addMediaDto: addMediaToListDTO, status: string) {
        const validMedia = await this.checkMediaValidity(addMediaDto);
        const Media = await this.UpsertMedia(addMediaDto, validMedia);

        return this.drizzle.db.insert(userMediaCollections)
            .values({
                userId: userId,
                mediaId: Media.id,
                status: status,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [userMediaCollections.userId, userMediaCollections.mediaId],
                set: {
                    status: status,
                    updatedAt: new Date(),
                },
            })
            .returning();
    }

    async getMyCollection(userId: string) {
        return this.drizzle.db.select({
            id: userMediaCollections.id,
            status: userMediaCollections.status,
            rating: userMediaCollections.rating,
            comment: userMediaCollections.comment,
            updatedAt: userMediaCollections.updatedAt,
            seasonInfo: {
            title: seasons_tvshows.title,
            number: seasons_tvshows.seasonNumber,
            },
            MediaInfo: {
                id: media.id,
                title: media.title,
                posterUrl: media.posterUrl,
                type: media.type,
                provider: media.provider,
                externalId: media.externalId,
            }
        })
        .from(userMediaCollections)
        .innerJoin(media, eq(userMediaCollections.mediaId, media.id))
        .leftJoin(seasons_tvshows, eq(userMediaCollections.seasonId, seasons_tvshows.id))
        .where(eq(userMediaCollections.userId, userId))
        .orderBy(desc(userMediaCollections.updatedAt));
    }

    async removeFromCollection(userId: string, mediaId: string) {
        return this.drizzle.db.delete(userMediaCollections)
        .where(and(
            eq(userMediaCollections.userId, userId),
            eq(userMediaCollections.mediaId, mediaId)
        )).returning();
    }
                                      

    async getSeasonUuid(mediaId: string, seasonNumber: number): Promise<string> {
        const [season] = await this.drizzle.db.select({ id: seasons_tvshows.id })
            .from(seasons_tvshows)
            .where(and(
                eq(seasons_tvshows.mediaId, mediaId),
                eq(seasons_tvshows.seasonNumber, seasonNumber)
            ))
            .limit(1);
        
        if (!season) {
            throw new InternalServerErrorException(`Saison ${seasonNumber} introuvable pour ce média`);
        }
        return season.id;
    }
}
