import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ format: 'email', example: 'usuario@example.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
