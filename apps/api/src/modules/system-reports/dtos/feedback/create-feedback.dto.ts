import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { FeedbackCategory } from '../../enums/feedback-category.enum';

export class CreateFeedbackDto {
  @ApiProperty({ type: String, enum: FeedbackCategory })
  @IsEnum(FeedbackCategory)
  category: FeedbackCategory;

  @ApiProperty({ type: String })
  @IsString()
  @Length(10, 1024)
  message: string;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  deviceId?: string;
}
