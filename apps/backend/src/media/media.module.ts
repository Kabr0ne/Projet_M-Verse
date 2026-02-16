import { Module, Search } from '@nestjs/common';
import { MediaService } from './media.service';
import { TmdbService } from './tmdb/tmdb.service';
import { HttpModule } from '@nestjs/axios';
import { LogController } from './log.controller';
import { StatsController } from './stats.controller';
import { ListController } from './list.controller';
import { SearchController } from './search.controller';

@Module({
  controllers: [
    LogController,
    SearchController,
    ListController,
    StatsController
  ],
  providers: [MediaService, TmdbService], 
  imports: [HttpModule],
})
export class MediaModule {}