import { Exclude, Expose } from 'class-transformer';
import { RolesEnum } from '../../../enums/roles.enum.js';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  status: boolean;

  @Expose()
  username: string;

  @Expose()
  name: string;

  @Exclude()
  password: string;

  @Expose()
  roles: RolesEnum[];
}
