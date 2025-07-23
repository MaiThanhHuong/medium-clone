import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { I18n, I18nContext } from 'nestjs-i18n';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProfileResponseDto } from './dto/profile-response.dto';

@ApiTags('Profiles')
@Controller('api/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(OptionalAuthGuard)
  @Get(':username')
  @ApiOperation({ summary: 'Get a profile by username' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The profile has been successfully returned.',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found.',
  })
  @ApiBearerAuth('JWT-auth')
  async getProfile(
    @Param('username') username: string,
    @I18n() i18n: I18nContext,
    @GetUser() currentUser?: User,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.getProfile(username, i18n, currentUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':username/follow')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully followed the user.',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiBearerAuth('JWT-auth')
  async followUser(
    @GetUser() currentUser: User,
    @Param('username') username: string,
    @I18n() i18n: I18nContext,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.followUser(currentUser, username, i18n);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':username/follow')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully unfollowed the user.',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiBearerAuth('JWT-auth')
  async unfollowUser(
    @GetUser() currentUser: User,
    @Param('username') username: string,
    @I18n() i18n: I18nContext,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.unfollowUser(currentUser, username, i18n);
  }
}
