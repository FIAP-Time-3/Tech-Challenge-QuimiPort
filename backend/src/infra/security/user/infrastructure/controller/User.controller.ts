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
import { CreateOrUpdateUserDto } from '../dtos/User.request.dtos.js';
import { UserResponseDto } from '../dtos/User.response.dtos.js';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  async create(@Body() body: CreateOrUpdateUserDto): Promise<UserResponseDto> {
    return await this.service.create({ body });
  }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return await this.service.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 1, type: Number })
  async findOne(
    @Param('id', new ParseIntPipe())
    id: number,
  ): Promise<UserResponseDto> {
    return await this.service.findOne({ id });
  }

  @Put(':id')
  @ApiParam({ name: 'id', example: 1, type: Number })
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: CreateOrUpdateUserDto,
  ): Promise<UserResponseDto> {
    return await this.service.update({ id, body });
  }

  @Delete(':id')
  @ApiParam({ name: 'id', example: 1, type: Number })
  async remove(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<{ id: number }> {
    return await this.service.remove({ id });
  }
}
