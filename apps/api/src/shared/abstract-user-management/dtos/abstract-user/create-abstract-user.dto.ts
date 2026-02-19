import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class CreateAbstractUserDto {
  @ApiProperty({ type: String })
  @IsString()
  @Length(3, 50)
  @IsOptional()
  firstName?: string;

  @ApiProperty({ type: String })
  @IsString()
  @Length(3, 50)
  @IsOptional()
  lastName?: string;

  @ApiProperty({ type: Date })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({ type: String })
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ type: String })
  @IsString()
  @Length(3, 50)
  username: string;

  @ApiProperty({ type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  roleId?: string;
}
