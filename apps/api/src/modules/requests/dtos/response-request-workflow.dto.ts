import { ResponseWorkflowDto } from 'src/shared/workflows/dtos/response-workflow.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseRequestDto } from './response-request.dto';

export class ResponseRequestWorkflowDto extends ResponseWorkflowDto {
  @ApiProperty({
    type: ResponseRequestDto,
    description: 'The request details along with its workflow status',
  })
  @Expose()
  @Type(() => ResponseRequestDto)
  request: ResponseRequestDto;
}
