import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { DrizzleModule } from './db/drizzle.module';

@Module({
  imports: [DrizzleModule, AuthModule, MediaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
