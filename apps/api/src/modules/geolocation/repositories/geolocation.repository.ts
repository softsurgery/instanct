import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DatabaseAbstractRepository } from 'src/shared/database/repositories/database.repository';
import { GeolocationEntity } from '../entities/geolocation.entity';

@Injectable()
export class GeolocationRepository extends DatabaseAbstractRepository<GeolocationEntity> {
  constructor(
    @InjectRepository(GeolocationEntity)
    private readonly geolocationRepository: Repository<GeolocationEntity>,
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(geolocationRepository, txHost);
  }
}
