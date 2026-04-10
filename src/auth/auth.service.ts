import { timingSafeEqual } from 'crypto';
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
      !this.matchesCredential(loginDto.username, expectedUsername) ||
      !this.matchesCredential(loginDto.password, expectedPassword)
    ) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: loginDto.username,
      username: loginDto.username,
    });

    return { access_token: accessToken };
  }

  private matchesCredential(
    receivedValue: string,
    expectedValue: string,
  ): boolean {
    const receivedBuffer = Buffer.from(receivedValue);
    const expectedBuffer = Buffer.from(expectedValue);

    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(receivedBuffer, expectedBuffer);
  }
}
