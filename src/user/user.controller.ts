import { Controller, Get, Put, UseGuards, Body, Patch } from '@nestjs/common';
import { UsersService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller('api')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  getCurrentUser(@GetUser() user: User) {
    return { user };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('user')
  updateUser(
    @GetUser('id') userId: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(userId, updateUserDto);
  }
}
