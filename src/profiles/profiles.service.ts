import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(username: string, currentUser?: User) {
    const userToFind = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!userToFind) {
      throw new NotFoundException('Profile not found');
    }

    let following = false;
    if (currentUser) {
      const followCount = await this.prisma.user.count({
        where: {
          id: currentUser.id,
          following: {
            some: {
              id: userToFind.id,
            },
          },
        },
      });
      following = followCount > 0;
    }

    return this.buildProfileResponse(userToFind, following);
  }

  async followUser(currentUser: User, usernameToFollow: string) {
    if (currentUser.username === usernameToFollow) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const userToFollow = await this.prisma.user.findUnique({
      where: { username: usernameToFollow },
    });

    if (!userToFollow) {
      throw new NotFoundException('User to follow not found');
    }

    const isAlreadyFollowing = await this.prisma.user.count({
      where: {
        id: currentUser.id,
        following: { some: { id: userToFollow.id } },
      },
    });

    if (isAlreadyFollowing) {
      throw new BadRequestException('You are already following this user');
    }

    await this.prisma.user.update({
      where: { id: currentUser.id },
      data: {
        following: {
          connect: {
            id: userToFollow.id,
          },
        },
      },
    });

    return this.buildProfileResponse(userToFollow, true);
  }

  async unfollowUser(currentUser: User, usernameToUnfollow: string) {
    if (currentUser.username === usernameToUnfollow) {
      throw new BadRequestException('Cannot unfollow yourself');
    }

    const userToUnfollow = await this.prisma.user.findUnique({
      where: { username: usernameToUnfollow },
    });

    if (!userToUnfollow) {
      throw new NotFoundException('User to unfollow not found');
    }

    const isFollowing = await this.prisma.user.count({
      where: {
        id: currentUser.id,
        following: { some: { id: userToUnfollow.id } },
      },
    });

    if (!isFollowing) {
      throw new BadRequestException('You are not following this user');
    }

    await this.prisma.user.update({
      where: { id: currentUser.id },
      data: {
        following: {
          disconnect: {
            id: userToUnfollow.id,
          },
        },
      },
    });

    return this.buildProfileResponse(userToUnfollow, false);
  }

  private buildProfileResponse(profile: User, following: boolean) {
    return {
      profile: {
        username: profile.username,
        bio: profile.bio,
        image: profile.image,
        following,
      },
    };
  }
}
