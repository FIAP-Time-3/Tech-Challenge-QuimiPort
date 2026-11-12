import { ApiProperty } from '@nestjs/swagger';
export class LoginResponseDto {
  access_token: string;
  refresh_token: string;
}

export class SetupResponseDto {
  @ApiProperty({ example: true })
  requiresSetup: boolean;
}
