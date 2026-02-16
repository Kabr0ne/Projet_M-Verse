import { Post, UseGuards, Body, Request, Get, Query, Patch, Delete} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Controller } from '@nestjs/common';
import { TmdbService } from './tmdb/tmdb.service';
import { createListDTO } from './DTO/create_list.dto';
import { addMediaToListDTO } from './DTO/add_media_list.dto';


@ApiTags('Search')
@Controller('media/search')
export class SearchController {
    constructor(private readonly tmdbService: TmdbService) {}

    @Get('tmdb')
    @ApiOperation({ summary: 'Search for movies using the TMDB API' })
    async searchTMDB(@Query('title') title: string) {
        return this.tmdbService.searchMovies(title);
    }

    @Get('tmdb/:externalId')
    @ApiOperation({ summary: 'Get details for a specific movie using an TMDB ID' })
    async getMovieDetails(@Query('externalId') externalId: string) {
        return this.tmdbService.getMovieDetails(externalId);
    }

}
