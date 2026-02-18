import { Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Controller } from '@nestjs/common';
import { TmdbService } from './tmdb/tmdb.service';


@ApiTags('Search')
@Controller('media/search')
export class SearchController {
    constructor(private readonly tmdbService: TmdbService) {}

    @Get('tmdb/movie')
    @ApiOperation({ summary: 'Search for movies using the TMDB API' })
    async searchTMDB(@Query('title') title: string) {
        return this.tmdbService.searchMovies(title);
    }

    @Get('tmdb/movie/:externalId')
    @ApiOperation({ summary: 'Get details for a specific movie using an TMDB ID' })
    async getMovieDetails(@Query('externalId') externalId: string) {
        return this.tmdbService.getMovieDetails(externalId);
    }

    @Get('tmdb/show')
    @ApiOperation({ summary: 'Search for TV shows using the TMDB API' })
    async searchTVShows(@Query('title') title: string) {
        return this.tmdbService.searchTVShows(title);
    }

    @Get('tmdb/show/:externalId')
    @ApiOperation({ summary: 'Get details for a specific TV show using an TMDB ID' })
    async getTVShowDetails(@Query('externalId') externalId: string) {
        return this.tmdbService.getTVShowDetails(externalId);
    }
}
