import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseUserDto } from 'src/modules/users/dtos/user/response-user.dto';
import { ResponseDtoHelper } from 'src/shared/database/dtos/database.response.dto';

export class ResponseRequestDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: String })
  @Expose()
  senderId: string;

  @ApiProperty({ type: ResponseUserDto })
  @Expose()
  @Type(() => ResponseUserDto)
  sender: ResponseUserDto;

  @ApiProperty({ type: [ResponseUserDto] })
  @Expose()
  @Type(() => ResponseUserDto)
  receivers: ResponseUserDto[];

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  description?: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  place?: string;

  @ApiProperty({ type: Date, nullable: true })
  @Expose()
  time?: Date;
}
