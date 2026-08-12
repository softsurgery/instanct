import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DatabaseAbstractRepository } from 'src/shared/database/repositories/database.repository';
import { UserDeviceEntity } from '../entities/user-device.entity';

@Injectable()
export class UserDeviceRepository extends DatabaseAbstractRepository<UserDeviceEntity> {
  constructor(
    @InjectRepository(UserDeviceEntity)
    private readonly userDeviceRepository: Repository<UserDeviceEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(userDeviceRepository, txHost);
  }
}
