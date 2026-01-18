import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { UserUploadEntity } from '../../entities/user-upload.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  declare uploads: Pick<UserUploadEntity, 'id' | 'order' | 'uploadId'>[];
}
