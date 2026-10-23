import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTemplateDto {
  @ApiProperty({ type: String, example: "welcome-email" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  content: string;
}
