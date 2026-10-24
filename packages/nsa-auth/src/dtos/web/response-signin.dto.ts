import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ResponseAbstractUserDto } from "@softsurgery/nsa-um/dtos/abstract-user/response-abstract-user.dto";
import { getUserDto } from "@softsurgery/nsa-um/registries/user-binding.registry";

export class ResponseSigninDto {
  @ApiProperty({ type: () => getUserDto() })
  @Expose()
  @Type(() => getUserDto())
  user?: ResponseAbstractUserDto;

  @ApiProperty({
    type: String,
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  access_token: string;

  @ApiProperty({
    type: String,
    example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  refresh_token: string;
}
