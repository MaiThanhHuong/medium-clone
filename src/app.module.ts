import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from '../prisma/prisma.module';

import { ProfilesModule } from './profiles/profiles.module';
import { I18nModule } from 'nestjs-i18n';
import { i18nConfig } from './configs/i18n.config';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [
    I18nModule.forRoot(i18nConfig),
    AuthModule,
    UserModule,
    PrismaModule,
    ProfilesModule,
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
