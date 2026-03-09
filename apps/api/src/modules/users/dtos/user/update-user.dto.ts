import { ApiProperty } from '@nestjs/swagger';
import { UserUploadEntity } from '../../entities/user-upload.entity';
import { UpdateAbstractUserDto } from 'src/shared/abstract-user-management/dtos/abstract-user/update-abstract-user.dto';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Gender } from 'src/shared/abstract-user-management/enums/gender.enum';

export class UpdateUserDto extends UpdateAbstractUserDto {
  @ApiProperty({ type: String })
  @IsString()
  @Length(8, 20)
  @IsOptional()
  phone?: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ type: String, enum: Gender, example: Gender.Male })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ type: String, nullable: true })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ type: String, nullable: true })
  @IsString()
  @IsOptional()
  linkedin?: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  pictureId?: number;

  @ApiProperty({ isArray: true, description: 'ID of uploaded file' })
  @IsArray()
  @IsOptional()
  declare uploads?: Pick<UserUploadEntity, 'id' | 'order' | 'uploadId'>[];
}
