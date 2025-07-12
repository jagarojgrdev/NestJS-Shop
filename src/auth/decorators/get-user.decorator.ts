import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';

export const GetUser = createParamDecorator(
  // Declaramos la data que pasamos desde el controlador y el contexto (petición)
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    // Tranformamos la petición
    const req = ctx.switchToHttp().getRequest<Request>();
    // Obtenemos el objeto user
    const user = (req as Request & { user?: User }).user;

    if (!user) {
      throw new InternalServerErrorException('User not found (Request)');
    }

    //Si existe arametro, mandamos info del parametro, sino objeto completo
    return data ? user[data] : user;
  },
);
