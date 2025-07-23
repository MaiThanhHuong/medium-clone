import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class ProfileDto {
  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'I am a software engineer.' })
  bio: string | null;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  image: string | null;

  @ApiProperty({ example: true })
  following: boolean;

  constructor(user: User, following: boolean) {
    this.username = user.username;
    this.bio = user.bio;
    this.image = user.image;
    this.following = following;
  }
}

export class ProfileResponseDto {
  @ApiProperty()
  profile: ProfileDto;

  constructor(profile: ProfileDto) {
    this.profile = profile;
  }
}
