import { UseGuards, Request, Get, Query} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Controller } from '@nestjs/common';
import { MediaService } from './media.service';



@ApiTags('Stats')
@ApiBearerAuth('JWT-authorization')
@UseGuards(AuthGuard('jwt'))
@Controller('media/stats')
export class StatsController {
    constructor(private readonly mediaService: MediaService) {}

    @Get(':mediaType')
    @ApiOperation({ summary: 'Get statistics for a specific media type' })
    async getStats(@Request() req, @Query('mediaType') mediaType: string) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.getStatsByType(userId, mediaType);
    }

}
