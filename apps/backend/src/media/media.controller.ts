import { Post, UseGuards, Body, Request, Get, Query, Patch, Delete} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Controller } from '@nestjs/common';
import { MediaService } from './media.service';
import { addLogDTO } from './DTO/add_log.dto';
import { TmdbService } from './tmdb/tmdb.service';
import { updateLogDTO } from './DTO/update_log.dto';
import { get } from 'axios';

@ApiTags('Media')

@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService, private readonly tmdbService: TmdbService) {}


    //Activity Log Endpoints
    @Post('add-log')
    @ApiBearerAuth('JWT-authorization')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Add a log for a media item' })
    async addLog(@Request() req, @Body() logData: addLogDTO) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.addLog(userId, logData);
    }

    @Get('my-logs')
    @ApiBearerAuth('JWT-authorization')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get all logs for the authenticated user' })
    async getUserLogs(@Request() req) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.getUserLogs(userId);
    }

    @Patch('log/:id')
    @ApiBearerAuth('JWT-authorization')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Update a specific log by ID' })
    async updateLog(@Request() req, @Query('id') logId: string, @Body() logData: updateLogDTO) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.updateLog(userId, logId, logData);
    }

    @Delete('log/:id')
    @ApiBearerAuth('JWT-authorization')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Delete a specific log by ID' })
    async deleteLog(@Request() req, @Query('id') logId: string) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.deleteLog(userId, logId);
    }

    //External API Endpoints
    @Get('search/tmdb')
    @ApiOperation({ summary: 'Search for movies using the TMDB API' })
    async searchTMDB(@Query('title') title: string) {
        return this.tmdbService.searchMovies(title);
    }

    @Get('movie/tmdb/:externalId')
    @ApiOperation({ summary: 'Get details for a specific movie using an TMDB ID' })
    async getMovieDetails(@Query('externalId') externalId: string) {
        return this.tmdbService.getMovieDetails(externalId);
    }

}