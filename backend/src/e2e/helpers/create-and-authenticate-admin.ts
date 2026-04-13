import request from 'supertest';
import { LoginDto } from '../../auth/dto/login.dto';

type LoginResponse = {
  access_token: string;
};

export async function createAndAuthenticateAdmin(
  httpServer: Parameters<typeof request>[0],
): Promise<{ token: string }> {
  const response = await request(httpServer)
    .post('/auth/login')
    .send({
      username: 'admin',
      password: 'admin',
    } satisfies LoginDto)
    .expect(201);

  return {
    token: (response.body as LoginResponse).access_token,
  };
}
