import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { TmdbService } from './tmdb/tmdb.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [MediaController],
  providers: [MediaService, TmdbService], 
  imports: [HttpModule],
})
export class MediaModule {}