import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterDto } from './dto/auth.dto';
import { User } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService, // Assuming JwtService is imported and used for token generation
  ) {}

  async register(userData: RegisterDto): Promise<User> {
    // Check if user already exists
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

  async login(userData: { email: string; password: string }): Promise<any> {
    // Check if user exists
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
    // Check if password is correct
    const isPasswordValid = await compare(userData.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(
        { message: 'Invalid email or password' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    // Generate access token (if needed, not implemented here)
    const payload = { id: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: '1h',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }
}
