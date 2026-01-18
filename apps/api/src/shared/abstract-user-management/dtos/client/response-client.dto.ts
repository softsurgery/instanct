import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ResponseDtoHelper } from 'src/shared/database/dtos/database.response.dto';

export class ResponseClientDto extends ResponseDtoHelper {
  @ApiProperty({ type: String })
  @Expose()
  id: string;

  @ApiProperty({ type: String })
  @Expose()
  firstName?: string;

  @ApiProperty({ type: String })
  @Expose()
  lastName?: string;

  @ApiProperty({ type: Date })
  @Expose()
  dateOfBirth?: Date;

  @ApiProperty({ type: Boolean, default: false })
  @Expose()
  isActive?: boolean;

  @Exclude()
  password?: string;

  @ApiProperty({ type: String })
  @Expose()
  username: string;

  @ApiProperty({ type: String })
  @Expose()
  email: string;

  @ApiProperty({ type: Date, default: false })
  @Expose()
  emailVerified?: Date;
}
