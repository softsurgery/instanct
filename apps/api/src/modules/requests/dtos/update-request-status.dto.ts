import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { RequestEvent } from '../enums/request-event.enum';

export class UpdateRequestStatusDto {
  @ApiProperty({
    enum: RequestEvent,
    description: 'The workflow event to trigger on the request',
  })
  @IsEnum(RequestEvent)
  event: RequestEvent;

  @ApiPropertyOptional({
    type: String,
    description: 'Reason provided when canceling or declining a request',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @ValidateIf(
    (dto: UpdateRequestStatusDto) => dto.event === RequestEvent.Cancel,
  )
  @IsNotEmpty({ message: 'Cancellation reason is required' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancelReason?: string;
}
