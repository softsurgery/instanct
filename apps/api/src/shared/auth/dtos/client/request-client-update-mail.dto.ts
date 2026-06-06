import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RequestClientUpdateMailDto {
  @ApiProperty({ type: String, example: 'super-secret-password' })
  @IsString()
  password: string;

  @ApiProperty({ type: String })
  @IsEmail()
  email: string;
}
