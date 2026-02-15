import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max, IsBoolean } from 'class-validator';

@ApiSchema({ description: 'Rules for adding a log' })
export class addLogDTO {
    //Media
    @ApiProperty({ example: '643586', description: 'external ID from provider' })
    @IsString()
    externalId: string;

    @ApiProperty({ example: 'TMDB', description: 'Provider of the media (TMDB, RAWG, LASTFM)' })
    @IsString()
    provider: string;

    @ApiProperty({ example: 'MOVIE', description: 'Type of media (MOVIE, GAME, ALBUM, SHOW)' })
    @IsString()
    type: string;

    @ApiProperty({ example: "Willy's Wonderland", description: 'Title of the media' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'https://image.tmdb.org/t/p/w500/keEnkeAvifw8NSEC4f6WsqeLJgF.jpg', description: 'URL of the media poster' })
    @IsString()
    posterUrl?: string;

    //Activity_Log
    @ApiProperty({ example: 'WATCHED', description: 'Status of the media (WATCHED, COMPLETED)' })
    @IsString()
    status: string;

    @ApiProperty({ example: false, description: 'Status of rewatching, false if not rewatched, true if rewatched' })
    @IsBoolean()
    rewatched: boolean;

    @ApiProperty({ example: 8.5, description: 'Rating given to the media (0-10)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    rating?: number;

    @ApiProperty({ example: true, description: 'Status of liking, false if not liked, true if liked' })
    @IsBoolean()
    liked: boolean;

    @ApiProperty({ example: 'Great movie with stunning visuals!', description: 'Comment about the media' })
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiProperty({ example: 120, description: 'Runtime of the media in minutes' })
    @IsNumber()
    runtime: number;

    @ApiProperty({ example: 'Action, Adventure, Comedy', description: 'Genres of the media' })
    @IsString()
    genres: string;

}
