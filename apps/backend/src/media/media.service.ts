import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { media, activityLogs } from '../db/schema';
import { addLogDTO } from './DTO/add_log.dto';
import { eq, desc } from 'drizzle-orm';


@Injectable()
export class MediaService {
  constructor(private drizzle: DrizzleService) {}

    async addLog(userId: string, logData: addLogDTO) {
        try {
            //UPSERT Media
            const [Media] = await this.drizzle.db.insert(media)
                .values({
                    externalId: logData.externalId,
                    provider: logData.provider,
                    type: logData.type,
                    title: logData.title,
                    posterUrl: logData.posterUrl,
                })
                .onConflictDoUpdate({
                    target: [media.externalId, media.provider],
                    set: {
                        title: logData.title,
                        posterUrl: logData.posterUrl,
                    },
                })
                .returning();

            //Insert Log
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
}