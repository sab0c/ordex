import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const expectedUsername =
      this.configService.getOrThrow<string>('AUTH_USERNAME');
    const expectedPassword =
      this.configService.getOrThrow<string>('AUTH_PASSWORD');

    if (
      loginDto.username !== expectedUsername ||
      loginDto.password !== expectedPassword
    ) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const access_token = await this.jwtService.signAsync({
      sub: loginDto.username,
      username: loginDto.username,
    });

    return { access_token };
  }
}
