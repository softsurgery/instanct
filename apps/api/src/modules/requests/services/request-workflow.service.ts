import { AbstractWorkflowService } from 'src/shared/workflows/services/workflow.service';
import { Injectable } from '@nestjs/common';
import { RequestStatus } from '../enums/request-status.enum';
import { RequestEvent } from '../enums/request-event.enum';
import { RequestService } from './request.service';
import { requestMachine } from '../workflows/request.workflow';

@Injectable()
export class RequestWorkflowService extends AbstractWorkflowService<
  RequestStatus,
  RequestEvent
> {
  constructor(private readonly requestService: RequestService) {
    super(requestMachine, RequestEvent);
  }

  async findOneById(id: number, join?: string) {
    const request = await this.requestService.findOneById(id, join);
    return {
      status: request?.status,
      request,
    };
  }

  async next(id: number, event: RequestEvent) {
    const request = await this.requestService.findOneById(id);
    if (!request) {
      throw new Error(`Request with id ${id} not found`);
    }
    const newStatus = this.transition(request?.status, event);
    await this.requestService.save({ id: request?.id, status: newStatus });
    return this.findOneById(id);
  }
}
