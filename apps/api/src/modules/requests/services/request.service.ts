import { Injectable, NotFoundException } from '@nestjs/common';
import { AbstractCrudService } from 'src/shared/database/services/abstract-crud.service';
import { RequestEntity } from '../entities/request.entity';
import { RequestRepository } from '../repositories/request.repository';
import { UserService } from 'src/modules/users/services/user.service';
import { CreateRequestDto } from '../dtos/create-request.dto';

@Injectable()
export class RequestService extends AbstractCrudService<RequestEntity> {
  requestRepository: RequestRepository;
  constructor(
    requestRepository: RequestRepository,
    private readonly userService: UserService,
  ) {
    super(requestRepository);
    this.requestRepository = requestRepository;
  }

  async sendRequest(
    data: CreateRequestDto,
    senderId: string,
  ): Promise<RequestEntity> {
    const users = await Promise.all(
      data.receiversIds.map(async (id) => {
        const user = await this.userService.findOneById(id);

        if (!user) {
          throw new NotFoundException(`User with id ${id} not found`);
        }

        return user;
      }),
    );

    return this.requestRepository.save({
      ...data,
      senderId,
      receivers: users,
    });
  }
}
