import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { UserService } from '../../application/User.service.js';
import {
  CreateFirstUserDto,
  CreateOrUpdateUserDto,
} from '../dtos/User.request.dtos.js';
import { UserResponseDto } from '../dtos/User.response.dtos.js';
import { AllowedRoles } from '../../../decorators/allowedRoles.decorator.js';
import { RolesEnum } from '../../../enums/roles.enum.js';
import { SetPublic } from '../../../decorators/setPublic.decorator.js';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post('first_access')
  @SetPublic()
  async createFirstAdmin(
    @Body() body: CreateFirstUserDto,
  ): Promise<UserResponseDto> {
    return await this.service.createFirst({
      body,
    });
  }

  @Post()
  @AllowedRoles([RolesEnum.ADMINISTRADOR])
  async create(@Body() body: CreateOrUpdateUserDto): Promise<UserResponseDto> {
    return await this.service.create({ body });
  }

  @Get()
  @AllowedRoles([RolesEnum.ADMINISTRADOR])
  async findAll(): Promise<UserResponseDto[]> {
    return await this.service.findAll();
  }

  @Get(':id')
  @AllowedRoles([RolesEnum.ADMINISTRADOR])
  @ApiParam({ name: 'id', example: 1, type: Number })
  async findOne(
    @Param('id', new ParseIntPipe())
    id: number,
  ): Promise<UserResponseDto> {
    return await this.service.findOne({ id });
  }

  @Put(':id')
  @AllowedRoles([RolesEnum.ADMINISTRADOR])
  @ApiParam({ name: 'id', example: 1, type: Number })
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: CreateOrUpdateUserDto,
  ): Promise<UserResponseDto> {
    return await this.service.update({ id, body });
  }

  @Delete(':id')
  @AllowedRoles([RolesEnum.ADMINISTRADOR])
  @ApiParam({ name: 'id', example: 1, type: Number })
  async remove(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<{ id: number }> {
    return await this.service.remove({ id });
  }
}
