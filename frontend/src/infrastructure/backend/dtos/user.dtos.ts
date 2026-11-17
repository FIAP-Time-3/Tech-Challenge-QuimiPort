export type UserRole =
  | 'ADMINISTRADOR'
  | 'GESTOR'
  | 'OPERADOR'
  | 'TECNICO'
  | 'DOCUMENTACAO'
  | 'QUALIDADE'
  | 'INSPETOR';

export interface CreateFirstAdminRequestDto {
  username: string;
  name: string;
  password: string;
}

export interface CreateOrUpdateUserRequestDto extends CreateFirstAdminRequestDto {
  roles?: UserRole[];
  status?: boolean;
}

export interface UserResponseDto {
  id: number;
  username: string;
  name: string;
  roles: UserRole[];
  status: boolean;
}

export interface RemoveUserResponseDto {
  id: number;
}
