import { PartialType } from '@nestjs/swagger';
import { CreateBugInterestedUserDto } from './create-bug-interested-user.dto';

export class UpdateBugInterestedUserDto extends PartialType(
  CreateBugInterestedUserDto,
) {}
