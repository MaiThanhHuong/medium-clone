import { Injectable, NotFoundException } from '@nestjs/common';
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
    // Nếu có người dùng đang đăng nhập, kiểm tra xem họ có follow profile này không
    if (currentUser) {
      const followRelation = await this.prisma.user.findFirst({
        where: {
          id: currentUser.id,
          following: {
            some: {
              id: userToFind.id,
            },
          },
        },
      });
      if (followRelation) {
        following = true;
      }
    }

    return this.buildProfileResponse(userToFind, following);
  }

  async followUser(currentUser: User, usernameToFollow: string) {
    if (currentUser.username === usernameToFollow) {
      throw new NotFoundException('Cannot follow yourself');
    }

    const userToFollow = await this.prisma.user.findUnique({
      where: { username: usernameToFollow },
    });

    if (!userToFollow) {
      throw new NotFoundException('User to follow not found');
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
    const userToUnfollow = await this.prisma.user.findUnique({
      where: { username: usernameToUnfollow },
    });

    if (!userToUnfollow) {
      throw new NotFoundException('User to unfollow not found');
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
