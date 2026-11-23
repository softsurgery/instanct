import { AbstractWorkflowService } from '@softsurgery/nsa-workflows/services/workflow.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async next(id: number, event: RequestEvent, cancelReason?: string) {
    const request = await this.requestService.findOneById(id, 'session');
    if (!request) {
      throw new NotFoundException(`Request with id ${id} not found`);
    }

    const session = request.session;
    const isArchived =
      Boolean(session?.ended) ||
      (session?.plannedEnd
        ? new Date(session.plannedEnd) <= new Date()
        : false);
    if (isArchived) {
      throw new BadRequestException(
        'Cannot update a request for an archived session',
      );
    }

    const newStatus = this.transition(request.status, event);
    await this.requestService.save({
      id: request.id,
      status: newStatus,
      cancelReason,
    });
    return this.findOneById(id);
  }
}
