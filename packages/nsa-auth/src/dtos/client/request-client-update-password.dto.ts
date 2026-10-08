import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RequestClientUpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
