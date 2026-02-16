import { UseGuards, Request, Get, Query} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Controller } from '@nestjs/common';
import { MediaService } from './media.service';



@ApiTags('Collection')
@ApiBearerAuth('JWT-authorization')
@UseGuards(AuthGuard('jwt'))
@Controller('media/collection')
export class CollectionController {
    constructor(private readonly mediaService: MediaService) {}

    @Get('me')
    @ApiOperation({ summary: 'Get user collection grouped by media type' })
    async getUserCollection(@Request() req) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.getMyCollection(userId);
    }

}
