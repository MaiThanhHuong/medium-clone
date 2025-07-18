import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto): Promise<User> {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto): Promise<User> {
    return this.authService.login(body);
  }
}
