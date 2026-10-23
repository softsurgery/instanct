import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseDtoHelper } from '@softsurgery/nsa-database';
import { getUserDto } from '@softsurgery/nsa-um/registries/user-binding.registry';
import { ResponseAbstractUserDto } from '@softsurgery/nsa-um/dtos/abstract-user/response-abstract-user.dto';

export class ResponseConversationUserDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: String })
  @Expose()
  userId: string;

  @ApiProperty({ type: Number })
  @Expose()
  conversationId: number;

  @ApiProperty({ type: () => getUserDto() })
  @Expose()
  @Type(() => getUserDto())
  user: ResponseAbstractUserDto;

  @ApiProperty({ type: Date })
  @Expose()
  lastCheck: Date;
}
