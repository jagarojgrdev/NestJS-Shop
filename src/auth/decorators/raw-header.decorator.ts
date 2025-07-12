import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RawHeaders as RawHeadersInterface } from '../interfaces/raw-headers.interface';

export const RawHeaders = createParamDecorator(
  // Declaramos la data que pasamos desde el controlador y el contexto (petición)
  //Me creo interfaz raw headers
  (data: keyof RawHeadersInterface | undefined, ctx: ExecutionContext) => {
    // Tranformamos la petición
    const req = ctx.switchToHttp().getRequest<Request>();
    // Obtenemos el objeto RawHeadersInterface
    return (req as Request & { rawHeaders?: RawHeadersInterface }).rawHeaders;
  },
);
