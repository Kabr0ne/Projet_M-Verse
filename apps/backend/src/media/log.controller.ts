import { Post, UseGuards, Body, Request, Get, Query, Patch, Delete} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Controller } from '@nestjs/common';
import { MediaService } from './media.service';
import { addLogDTO } from './DTO/add_log.dto';
import { updateLogDTO } from './DTO/update_log.dto';


@ApiTags('Log')
@ApiBearerAuth('JWT-authorization')
@UseGuards(AuthGuard('jwt'))
@Controller('media/logs')
export class LogController {
    constructor(private readonly mediaService: MediaService) {}

    @Post()
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

    @Patch(':id')
    @ApiOperation({ summary: 'Update a specific log by ID' })
    async updateLog(@Request() req, @Query('id') logId: string, @Body() logData: updateLogDTO) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.updateLog(userId, logId, logData);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a specific log by ID' })
    async deleteLog(@Request() req, @Query('id') logId: string) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.deleteLog(userId, logId);
    }


}
