import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import {
  LoginRequestDto,
  RefreshRequestDto,
} from '../infrastructure/dtos/login.request.dtos.js';
import { RolesEnum } from '../../enums/roles.enum.js';
import { plainToInstance } from 'class-transformer';
import { LoginResponseDto } from '../infrastructure/dtos/login.response.dtos.js';

const mockedUsers = [
  {
    id: 1,
    username: 'mockADMINISTRADOR',
    password: 'mockedPass',
    roles: [RolesEnum.ADMINISTRADOR],
  },
  {
    id: 2,
    username: 'mockGESTOR',
    password: 'mockedPass',
    roles: [RolesEnum.GESTOR],
  },
  {
    id: 3,
    username: 'mockOPERADOR',
    password: 'mockedPass',
    roles: [RolesEnum.OPERADOR],
  },
  {
    id: 4,
    username: 'mockTECNICO',
    password: 'mockedPass',
    roles: [RolesEnum.TECNICO],
  },
  {
    id: 5,
    username: 'mockDOCUMENTACAO',
    password: 'mockedPass',
    roles: [RolesEnum.DOCUMENTACAO],
  },
  {
    id: 6,
    username: 'mockQUALIDADE',
    password: 'mockedPass',
    roles: [RolesEnum.QUALIDADE],
  },
  {
    id: 7,
    username: 'mockINSPETOR',
    password: 'mockedPass',
    roles: [RolesEnum.INSPETOR],
  },
];

@Injectable()
export class LoginService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(body: LoginRequestDto) {
    const { password, username } = body;
    const user = mockedUsers.find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );

    if (user?.password !== password) {
      throw new UnauthorizedException('Login ou Senha incorreta');
    }
    const { id, roles } = user;

    const access_token = await this.jwt.signAsync({ id, username, roles });
    const refresh_token = await this.jwt.signAsync(
      {
        id,
      },
      {
        expiresIn: '7d',
      },
    );

    return plainToInstance(LoginResponseDto, { access_token, refresh_token });
  }

  async refresh(body: RefreshRequestDto) {
    const { refresh_token } = body;

    const decodedToken = await this.jwt.decode(refresh_token);

    const user = mockedUsers.find((user) => user.id === decodedToken?.id);

    if (!user || !decodedToken) {
      throw new UnauthorizedException('Token Invalido');
    }

    const { id, username, roles } = user;

    const access_token = await this.jwt.signAsync({ id, username, roles });
    const new_refresh_token = await this.jwt.signAsync(
      {
        id,
      },
      {
        expiresIn: '7d',
      },
    );

    return plainToInstance(LoginResponseDto, {
      access_token,
      refresh_token: new_refresh_token,
    });
  }
}
