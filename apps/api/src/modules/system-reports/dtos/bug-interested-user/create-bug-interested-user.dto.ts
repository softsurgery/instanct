import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBugInterestedUserDto {
  @ApiProperty({ type: Number, description: 'ID of the bug' })
  @IsNumber()
  @IsNotEmpty()
  bugId: number;

  @ApiProperty({ type: String, description: 'ID of the user' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
