import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUser(userId: number, dto: UpdateUserDto) {
    const userToUpdate = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (dto.email) {
      const existingUserWithEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        throw new ConflictException(
          'Email is already in use by another account.',
        );
      }
    }
    if (dto.username) {
      const existingUserWithUsername = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });

      if (existingUserWithUsername && existingUserWithUsername.id !== userId) {
        throw new ConflictException(
          'Username is already in use by another account.',
        );
      }
    }

    const { passwordConfirmation, ...updateData } = dto;

    if (updateData.password) {
      updateData.password = await hash(updateData.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }
}
