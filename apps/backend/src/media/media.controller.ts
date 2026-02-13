import { Post, UseGuards, Body, Request, Get} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Controller } from '@nestjs/common';
import { MediaService } from './media.service';
import { addLogDTO } from './DTO/add_log.dto';

@ApiTags('Media')
@ApiBearerAuth('JWT-authorization')
@UseGuards(AuthGuard('jwt'))
@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    @Post('add-log')
    @ApiOperation({ summary: 'Add a log for a media item' })
    async addLog(@Request() req, @Body() logData: addLogDTO) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.addLog(userId, logData);
    }

    @Get('my-logs')
    @ApiOperation({ summary: 'Get all logs for the authenticated user' })
    async getUserLogs(@Request() req) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.getUserLogs(userId);
    }
}