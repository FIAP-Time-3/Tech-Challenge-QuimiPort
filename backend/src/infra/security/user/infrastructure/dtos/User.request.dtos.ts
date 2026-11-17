import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(RolesEnum, { each: true })
  roles?: RolesEnum[];

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  status: boolean = true;
}

export class CreateUserDto extends BaseUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto extends BaseUserDto {}

export class CreateFirstUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
