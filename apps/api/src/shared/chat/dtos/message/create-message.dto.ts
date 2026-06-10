import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { MessageVariant } from '../../enums/message-variant.enum';
import { StaticMessageEnum } from '@/app/enums/static-message.enum';

export class CreateMessageDto {
  @ApiProperty({ type: String })
  @IsString()
  @MinLength(1)
  @IsOptional()
  content?: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  conversationId: number;

  @ApiProperty({ type: String, enum: MessageVariant })
  @IsEnum(MessageVariant)
  variant: MessageVariant;

  @ApiProperty({ type: String, enum: StaticMessageEnum })
  @IsEnum(StaticMessageEnum)
  @IsOptional()
  static?: StaticMessageEnum;
}
