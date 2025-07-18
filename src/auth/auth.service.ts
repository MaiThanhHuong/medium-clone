import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(userData: RegisterDto): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: userData.email,
      },
    });
    if (user) {
      throw new HttpException(
        { message: 'This email is already registered' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashPassword = await hash(userData.password, 10);
    const res = await this.prismaService.user.create({
      data: { ...userData, password: hashPassword },
    });

    return res;
  }

  async login(userData: LoginDto): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: userData.email,
      },
    });
    if (!user) {
      throw new HttpException(
        { message: 'Invalid email or password' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const isPasswordValid = await compare(userData.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(
        { message: 'Invalid email or password' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { id: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: '1h',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: '7d',
    });

    const { password, ...userInfo } = user;
    return { user: userInfo, accessToken, refreshToken };
  }
}
