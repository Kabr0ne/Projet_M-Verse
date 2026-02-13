import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { OmdbService } from './omdb/omdb.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [MediaController],
  providers: [MediaService, OmdbService], 
  imports: [HttpModule],
})
export class MediaModule {}