import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { AdminUser } from './entities/admin-user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUsersRepository: Repository<AdminUser>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const adminUser = await this.adminUsersRepository.findOne({
      where: {
        username: loginDto.username,
      },
    });

    if (!adminUser) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isPasswordValid = await compare(
      loginDto.password,
      adminUser.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: String(adminUser.id),
      username: adminUser.username,
    });

    return { access_token: accessToken };
  }
}
