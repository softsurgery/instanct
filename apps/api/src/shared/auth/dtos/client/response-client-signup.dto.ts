import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseUserDto } from 'src/shared/user-management/dtos/user/response-user.dto';

export class ResponseClientSignupDto {
  @ApiProperty({ type: ResponseUserDto })
  @Expose()
  @Type(() => ResponseUserDto)
  user: ResponseUserDto;
}
