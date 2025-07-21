import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(OptionalAuthGuard)
  @Get(':username')
  getProfile(
    @Param('username') username: string,
    @GetUser() currentUser?: User,
  ) {
    return this.profilesService.getProfile(username, currentUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':username/follow')
  followUser(
    @GetUser() currentUser: User,
    @Param('username') username: string,
  ) {
    return this.profilesService.followUser(currentUser, username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':username/follow')
  unfollowUser(
    @GetUser() currentUser: User,
    @Param('username') username: string,
  ) {
    return this.profilesService.unfollowUser(currentUser, username);
  }
}
