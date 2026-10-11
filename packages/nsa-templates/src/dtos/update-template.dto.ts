import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateTemplateDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  content?: string;
}
