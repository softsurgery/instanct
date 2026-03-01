import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { faker } from '@faker-js/faker';

export class RequestClientSignInDto {
  @ApiProperty({
    type: String,
    example: faker.internet.email(),
  })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, example: 'password123' })
  @IsString()
  @MinLength(1)
  password: string;
}
