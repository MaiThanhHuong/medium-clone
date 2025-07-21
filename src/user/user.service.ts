import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUser(userId: number, dto: UpdateUserDto) {
    if (dto.password) {
      dto.password = await hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }
}
