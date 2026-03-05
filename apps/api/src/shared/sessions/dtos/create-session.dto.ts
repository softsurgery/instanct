import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDate, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { SessionType } from 'src/app/enums/session.enum';

export class CreateSessionDto {
  @ApiProperty({ enum: SessionType })
  @IsEnum(SessionType)
  @IsOptional()
  sessionType?: SessionType;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  plannedStart?: Date;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  plannedEnd?: Date;

  @ApiProperty({ type: Object, required: false })
  @IsOptional()
  @IsObject()
  payload?: object;
}
