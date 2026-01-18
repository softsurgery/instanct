import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseUploadDto } from 'src/shared/uploads/dtos/response-upload.dto';

import { ResponseAbstractUserDto } from 'src/shared/abstract-user-management/dtos/abstract-user/response-abstract-user.dto';
import { Gender } from 'src/shared/abstract-user-management/enums/gender.enum';
import { ExperienceDto } from 'src/modules/users/dtos/walk-of-life/experience.dto';
import {
  Education,
  Experience,
  Skill,
} from 'src/modules/users/walk-of-life.interface';
import { EducationDto } from 'src/modules/users/dtos/walk-of-life/education.dto';
import { SkillDto } from 'src/modules/users/dtos/walk-of-life/skills.dto';
import { ResponseUserUploadDto } from '../user-upload/response-user-upload.dto';

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

  @ApiProperty({ type: Boolean, example: false })
  @Expose()
  isPrivate?: boolean;

  @ApiProperty({ type: String })
  @Expose()
  regionId?: number;

  @ApiProperty({ type: Number })
  @Expose()
  pictureId?: number;

  @ApiProperty({ type: ResponseUploadDto })
  @Expose()
  @Type(() => ResponseUploadDto)
  picture?: ResponseUploadDto;

  @ApiProperty({ type: ResponseUploadDto })
  @Expose()
  @Type(() => ResponseUploadDto)
  officialDocument?: ResponseUploadDto;

  @ApiProperty({ type: Number })
  @Expose()
  officialDocumentId?: number;

  @ApiProperty({ type: ResponseUploadDto })
  @Expose()
  @Type(() => ResponseUploadDto)
  driverLicenseDocument?: ResponseUploadDto;

  @ApiProperty({ type: Number })
  @Expose()
  driverLicenseDocumentId?: number;

  @ApiProperty({ type: [ResponseUserUploadDto] })
  @Expose()
  @Type(() => ResponseUserUploadDto)
  uploads: ResponseUserUploadDto[];

  @ApiProperty({ type: [ExperienceDto] })
  @Expose()
  @Type(() => ExperienceDto)
  experiences: Experience[];

  @ApiProperty({ type: [EducationDto] })
  @Expose()
  @Type(() => EducationDto)
  educations: Education[];

  @ApiProperty({ type: [SkillDto] })
  @Expose()
  @Type(() => SkillDto)
  skills: Skill[];
}
