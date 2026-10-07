import { ApiProperty } from '@nestjs/swagger';
import { ResponseDtoHelper } from 'nsa-database';
import { ResponseConversationDto } from '../conversation/response-conversation.dto';
import { Expose, Type } from 'class-transformer';
import { MessageVariant } from '../../enums/message-variant.enum';
import { ResponseAbstractUserDto } from 'nsa-um/dtos/abstract-user/response-abstract-user.dto';
import { StaticMessageEnum } from '../../enums/static-message.registry';
import { ResponseMessageUploadDto } from '../message-upload/response-message-upload.dto';
import { ResponseMessageLinkDto } from '../message-link/response-message-link.dto';

export class ResponseMessageDto extends ResponseDtoHelper {
  @ApiProperty({ type: Number })
  @Expose()
  id: number;

  @ApiProperty({ type: String })
  @Expose()
  content: string;

  @ApiProperty({ type: Number })
  @Expose()
  conversationId: number;

  @ApiProperty({ type: ResponseConversationDto })
  @Expose()
  @Type(() => ResponseConversationDto)
  conversation: ResponseConversationDto;

  @ApiProperty({ type: String })
  @Expose()
  userId: string;

  @ApiProperty({ type: ResponseAbstractUserDto })
  @Expose()
  @Type(() => ResponseAbstractUserDto)
  user: ResponseAbstractUserDto;

  @ApiProperty({ type: String, enum: MessageVariant })
  @Expose()
  variant: MessageVariant;

  @ApiProperty({ type: String, enum: StaticMessageEnum })
  @Expose()
  static?: StaticMessageEnum;

  @ApiProperty({ type: [ResponseMessageUploadDto] })
  @Expose()
  @Type(() => ResponseMessageUploadDto)
  uploads?: ResponseMessageUploadDto[];

  @ApiProperty({ type: [ResponseMessageLinkDto] })
  @Expose()
  @Type(() => ResponseMessageLinkDto)
  links?: ResponseMessageLinkDto[];
}
