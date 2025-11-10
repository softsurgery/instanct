import { HttpException, HttpStatus } from '@nestjs/common';

export class RefParamAlreadyExistsException extends HttpException {
  constructor() {
    super('RefParam already exists', HttpStatus.CONFLICT);
  }
}
