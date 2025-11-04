import { HttpException, HttpStatus } from '@nestjs/common';

export class GeolocationNotFoundException extends HttpException {
  constructor() {
    super('Geolocation not found', HttpStatus.NOT_FOUND);
  }
}
