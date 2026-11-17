export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RefreshRequestDto {
  refresh_token: string;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
}

export interface SetupResponseDto {
  requiresSetup: boolean;
}
