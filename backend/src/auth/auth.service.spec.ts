import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { AdminUser } from './entities/admin-user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let repository: jest.Mocked<Repository<AdminUser>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<AdminUser>>;

    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(AdminUser),
          useValue: repository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should return an access token for a valid seeded admin', async () => {
    const passwordHash = await hash('admin123', 10);

    repository.findOne.mockResolvedValue({
      id: 1,
      username: 'admin',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AdminUser);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const result = await service.login({
      username: 'admin',
      password: 'admin123',
    });

    expect(repository.findOne.mock.calls[0]?.[0]).toEqual({
      where: {
        username: 'admin',
      },
    });
    expect(jwtService.signAsync.mock.calls[0]?.[0]).toEqual({
      sub: '1',
      username: 'admin',
    });
    expect(result).toEqual({ access_token: 'jwt-token' });
  });

  it('should reject login when admin user does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.login({
        username: 'missing-admin',
        password: 'admin123',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtService.signAsync.mock.calls).toHaveLength(0);
  });

  it('should reject login when password is invalid', async () => {
    const passwordHash = await hash('admin123', 10);

    repository.findOne.mockResolvedValue({
      id: 1,
      username: 'admin',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AdminUser);

    await expect(
      service.login({
        username: 'admin',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtService.signAsync.mock.calls).toHaveLength(0);
  });
});
