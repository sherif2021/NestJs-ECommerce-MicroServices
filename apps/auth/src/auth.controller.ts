import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenUserAuth, RefreshTokenUserGuard, UserJwt } from '@app/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('refresh-token')
  @UseGuards(RefreshTokenUserGuard)
  refreshToken(@UserJwt() userAuth: RefreshTokenUserAuth) {
    return this.authService.login({ email: userAuth.email, password: userAuth.password });
  }
}
