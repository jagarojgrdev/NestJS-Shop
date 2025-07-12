import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

//Según chatGPT recomienda un filtro global de excepciones (verlo en un futuro)

export class ExceptionService {
  private readonly logger = new Logger('ExceptionService');

  // Indicamos con never que nunca se va a devolver un valor
  public handleException(error: any): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as Record<string, unknown>)['code'] === '23505'
    ) {
      throw new BadRequestException(
        (error as Record<string, unknown>)['detail'],
      );
    }

    console.log(error);

    throw new InternalServerErrorException(
      'Unexpected error - Check Server Logs',
    );
  }
}
