import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance } from 'class-transformer';
import { RolesEnum } from '../../../enums/roles.enum.js';

export class UserResponseDto {
  @ApiProperty({ type: 'integer' })
  @Expose()
  id: number;

  @ApiProperty({ type: Boolean })
  @Expose()
  status: boolean;

  @ApiProperty({ example: 'Bruno Dias' })
  @Expose()
  name: string;

  @ApiProperty({ format: 'email', example: 'usuario@example.com' })
  @Expose()
  email: string;

  @ApiHideProperty()
  @Exclude()
  password: string;

  @ApiProperty({ enum: RolesEnum })
  @Expose()
  role: RolesEnum;
}

export function toUserResponse<T extends { password: string }>(
  user: T,
): UserResponseDto {
  const safeUser = { ...user };
  Reflect.deleteProperty(safeUser, 'password');
  return plainToInstance(UserResponseDto, safeUser);
}
