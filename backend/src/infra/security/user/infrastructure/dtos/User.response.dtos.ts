import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
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

  @ApiProperty({ enum: RolesEnum, isArray: true })
  @Expose()
  roles: RolesEnum[];
}
