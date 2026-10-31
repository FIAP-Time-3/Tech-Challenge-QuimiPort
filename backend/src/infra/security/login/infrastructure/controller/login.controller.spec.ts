import { Test, TestingModule } from '@nestjs/testing';
import { LoginService } from '../../application/Login.service.js';
import { LoginController } from './login.controller.js';

describe('LoginController', () => {
  let controller: LoginController;
  const serviceMock = {
    login: vi.fn(),
    refresh: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [{ provide: LoginService, useValue: serviceMock }],
    }).compile();

    controller = module.get(LoginController);
  });

  it('encaminha credenciais ao serviço de login', async () => {
    const body = { username: 'bruno', password: 'secret' };
    const tokens = { access_token: 'access', refresh_token: 'refresh' };
    serviceMock.login.mockResolvedValue(tokens);

    await expect(controller.login(body)).resolves.toBe(tokens);
    expect(serviceMock.login).toHaveBeenCalledWith(body);
  });

  it('encaminha refresh token ao serviço', async () => {
    const body = { refresh_token: 'refresh' };
    const tokens = { access_token: 'new-access', refresh_token: 'new-refresh' };
    serviceMock.refresh.mockResolvedValue(tokens);

    await expect(controller.refresh(body)).resolves.toBe(tokens);
    expect(serviceMock.refresh).toHaveBeenCalledWith(body);
  });
});
