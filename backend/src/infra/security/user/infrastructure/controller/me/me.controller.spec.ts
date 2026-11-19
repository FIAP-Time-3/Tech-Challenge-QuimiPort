import { Test } from '@nestjs/testing';
import { UserService } from '../../../application/user.service.js';
import { MeController } from './me.controller.js';

it('consulta o usuário pelo id autenticado, sem depender de perfil administrador', async () => {
  const user = {
    id: 8,
    name: 'Maria Souza',
    email: 'maria@email.com',
    role: 'OPERADOR',
    status: true,
  };
  const findOne = vi.fn().mockResolvedValue(user);
  const module = await Test.createTestingModule({
    controllers: [MeController],
    providers: [{ provide: UserService, useValue: { findOne } }],
  }).compile();
  const controller = module.get(MeController);
  await expect(controller.getMe({ user: { id: 8 } })).resolves.toEqual(user);
  expect(findOne).toHaveBeenCalledWith({ id: 8 });
});
