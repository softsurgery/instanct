import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseStorageDto } from 'nsa-storage/dtos/response-storage.dto';
import { ResponseAbstractUserDto } from 'nsa-um/dtos/abstract-user/response-abstract-user.dto';
import { Gender } from 'nsa-um/enums/gender.enum';
import { ResponseUserUploadDto } from '../user-upload/response-user-upload.dto';
import { ResponseExperienceDto } from '../experience/response-experience.dto';
import { ResponseRefParamDto } from 'nsa-reference-types/dtos/ref-param/response-ref-param.dto';
import { ResponseEducationDto } from '../education/response-education.dto';
import { ResponseSessionDto } from 'nsa-sessions/dtos/response-session.dto';

export class ResponseUserDto extends ResponseAbstractUserDto {
  @ApiProperty({ type: String })
  @Expose()
  phone?: string;

  @ApiProperty({ type: String })
  @Expose()
  cin?: string;

  @ApiProperty({ type: String })
  @Expose()
  bio?: string;

  @ApiProperty({ type: String, enum: Gender, example: Gender.Male })
  @Expose()
  gender?: Gender;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  website?: string;

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  linkedin?: string;

  @ApiProperty({ type: Boolean, example: false })
  @Expose()
  isPrivate?: boolean;

  @ApiProperty({ type: String })
  @Expose()
  regionId?: number;

  @ApiProperty({ type: Number })
  @Expose()
  pictureId?: number;

  @ApiProperty({ type: ResponseStorageDto })
  @Expose()
  @Type(() => ResponseStorageDto)
  picture?: ResponseStorageDto;

  @ApiProperty({ type: Number })
  @Expose()
  coverId?: number;

  @ApiProperty({ type: ResponseStorageDto })
  @Expose()
  @Type(() => ResponseStorageDto)
  cover?: ResponseStorageDto;

  @ApiProperty({ type: [ResponseUserUploadDto] })
  @Expose()
  @Type(() => ResponseUserUploadDto)
  uploads: ResponseUserUploadDto[];

  @ApiProperty({ type: [ResponseExperienceDto] })
  @Expose()
  @Type(() => ResponseExperienceDto)
  experiences: ResponseExperienceDto[];

  @ApiProperty({ type: [ResponseEducationDto] })
  @Expose()
  @Type(() => ResponseEducationDto)
  educations: ResponseEducationDto[];

  @ApiProperty({ type: [ResponseRefParamDto] })
  @Expose()
  @Type(() => ResponseRefParamDto)
  industries: ResponseRefParamDto[];

  @ApiProperty({ type: ResponseSessionDto, nullable: true })
  @Expose()
  @Type(() => ResponseSessionDto)
  activeSession?: ResponseSessionDto;
}
