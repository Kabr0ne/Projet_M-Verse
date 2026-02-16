import { Post, UseGuards, Body, Request, Get, Query, Patch, Delete} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Controller } from '@nestjs/common';
import { MediaService } from './media.service';
import { createListDTO } from './DTO/create_list.dto';
import { addMediaToListDTO } from './DTO/add_media_list.dto';


@ApiTags('List')
@ApiBearerAuth('JWT-authorization')
@UseGuards(AuthGuard('jwt'))
@Controller('media/lists')
export class ListController {
    constructor(private readonly mediaService: MediaService) {}
 
    @Post()
    @ApiOperation({ summary: 'Create a new list' })
    async createList(@Request() req, @Body() listDto: createListDTO) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.createList(userId, listDto);
    }

    @Get('my-lists')
    @ApiOperation({ summary: 'Get all lists for the authenticated user' })
    async getUserLists(@Request() req) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.getUserLists(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get details for a specific list by ID' })
    async getListDetails(@Request() req, @Query('id') listId: string) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.getListItems(userId, listId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a specific list by ID' })
    async deleteList(@Request() req, @Query('id') listId: string) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.deleteList(userId, listId);
    }

    @Post(':id/add')
    @ApiOperation({ summary: 'Add a media item to a specific list by ID' })
    async addMediaToList(@Request() req, @Query('id') listId: string, @Body() addMediaDto: addMediaToListDTO) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.addMediaToList(userId, listId, addMediaDto);
    }

    @Delete(':id/media/:mediaId')
    @ApiOperation({ summary: 'Remove a media item from a specific list by ID' })
    async removeMediaFromList(@Request() req, @Query('id') listId: string, @Query('mediaId') mediaId: string) {
        const userId = req.user.userId; //From JWT payload
        return this.mediaService.removeMediaFromList(userId, listId, mediaId);
    }


}
