import { ApiProperty } from '@nestjs/swagger';

export class DatabaseHealthResponseDto {
  @ApiProperty({ example: true })
  database: boolean;
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  api: string;

  @ApiProperty({ enum: ['ok', 'degraded'] })
  status: string;

  @ApiProperty({ format: 'date-time' })
  timestamp: string;

  @ApiProperty({ example: '2min' })
  uptime: string;

  @ApiProperty({ type: () => DatabaseHealthResponseDto })
  services: DatabaseHealthResponseDto;
}
