import { Inject, Injectable } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    private jwtService: JwtService,
    @Inject('USER_SERVICE') private userClient: ClientProxy,) { }

  async register(registerDto: RegisterDto) {
    const result = await firstValueFrom(this.userClient.send(
      'create-user', registerDto,
    ).pipe(catchError(error => throwError(() => new RpcException(error.response)))));

    return this.genrateJwtToken(result);
  }

  async login(loginDto: LoginDto) {
    const result = await firstValueFrom(this.userClient.send(
      'get-user-by-email-password', loginDto,
    ).pipe(catchError(error => throwError(() => new RpcException(error.response)))));

    return this.genrateJwtToken(result);
  }

  private async genrateJwtToken(user: any): Promise<Object> {
    return {
      'accessToken': await this.jwtService.signAsync({
        id: user.id,
        rules: user.rules,
      }),
      'refreshToken': await this.jwtService.signAsync({
        id: user.id,
        email: user.email,
        password: user.password,
      }, {
        expiresIn: '1y',
        secret: process.env.JWT_REFRESH_SECRET_KEY,
      })
    };
  }
}
