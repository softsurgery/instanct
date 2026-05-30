import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RequestEvent } from '../enums/request-event.enum';

export class UpdateRequestStatusDto {
  @ApiProperty({
    enum: RequestEvent,
    description: 'The workflow event to trigger on the request',
  })
  @IsEnum(RequestEvent)
  event: RequestEvent;
}
