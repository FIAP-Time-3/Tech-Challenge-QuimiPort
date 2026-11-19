import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { RolesEnum } from '../../../enums/roles.enum.js';

export class BaseUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ format: 'email', example: 'usuario@example.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: RolesEnum, description: 'Perfil do usuário.' })
  @IsEnum(RolesEnum)
  role: RolesEnum;
}

export class CreateUserDto extends BaseUserDto {
  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  status: boolean = true;
}

export class UpdateUserDto extends BaseUserDto {
  @ApiPropertyOptional({
    description: 'Quando omitido, preserva o status atual.',
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class CreateFirstUserDto {
  @ApiProperty({ format: 'email', example: 'admin@example.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserPasswordResetDto {
  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class UserPasswordChangeDto {
  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  newPasswordConfirm: string;
}
