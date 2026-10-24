import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ResponseAbstractUserDto } from "@softsurgery/nsa-um/dtos/abstract-user/response-abstract-user.dto";
import { getUserDto } from "@softsurgery/nsa-um/registries/user-binding.registry";

export class ResponseClientSignupDto {
  @ApiProperty({ type: () => getUserDto() })
  @Expose()
  @Type(() => getUserDto())
  user?: ResponseAbstractUserDto;
}
