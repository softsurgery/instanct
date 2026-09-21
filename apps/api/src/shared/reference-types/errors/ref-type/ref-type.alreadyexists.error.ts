import { HttpException, HttpStatus } from '@nestjs/common';

export class RefTypeAlreadyExistsException extends HttpException {
  constructor() {
    super('RefType already exists', HttpStatus.CONFLICT);
  }
}
