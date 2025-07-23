import { ApiProperty } from '@nestjs/swagger';

class ProfileDataDto {
  @ApiProperty({ example: 'userB', description: 'Username of the profile' })
  username: string;

  @ApiProperty({
    example: 'I like to write code.',
    description: 'User biography',
    nullable: true,
  })
  bio: string | null;

  @ApiProperty({
    example: 'https://api.realworld.io/images/smiley-cyrus.jpeg',
    description: 'Link to user profile image',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({
    example: false,
    description: 'True if the current user is following this profile',
  })
  following: boolean;
}

export class ProfileResponseDto {
  @ApiProperty({ type: () => ProfileDataDto })
  profile: ProfileDataDto;
}
