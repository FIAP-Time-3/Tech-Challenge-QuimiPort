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

  @ApiPropertyOptional({
    enum: RolesEnum,
    isArray: true,
    description: 'Perfis atuais. Omitido na criação ou edição resulta em [].',
  })
  @IsOptional()
  @IsEnum(RolesEnum, { each: true })
  roles?: RolesEnum[];
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
