import { ApiProperty } from '@nestjs/swagger';
export class LoginResponseDto {
  @ApiProperty({ description: 'JWT de acesso para Authorization: Bearer.' })
  access_token: string;
  @ApiProperty({
    description: 'JWT de renovação, usado somente em /api/login/refresh.',
  })
  refresh_token: string;
}

export class SetupResponseDto {
  @ApiProperty({ example: true })
  requiresSetup: boolean;
}
