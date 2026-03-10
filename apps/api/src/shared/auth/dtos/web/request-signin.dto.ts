import { ApiProperty } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { IsString, Length } from 'class-validator';

export class RequestSignInDto {
  @ApiProperty({
    type: String,
    example: faker.internet.email(),
  })
  @IsString()
  usernameOrEmail: string;

  @ApiProperty({ type: String, example: 'password123' })
  @IsString()
  @Length(8, 128)
  password: string;
}
