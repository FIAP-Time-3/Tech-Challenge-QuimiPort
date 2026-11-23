import type { RolesEnum } from '../../enums/roles.enum.js';

export interface UpdateUserInput {
  name: string;
  email: string;
  role: RolesEnum;
  status?: boolean;
}

export interface CreateUserInput extends UpdateUserInput {
  password: string;
  status: boolean;
}

export type CreateFirstAdminInput = Pick<
  CreateUserInput,
  'name' | 'email' | 'password'
>;

export interface ResetPasswordInput {
  newPassword: string;
}

export interface ChangePasswordInput extends ResetPasswordInput {
  currentPassword: string;
  newPasswordConfirm: string;
}
