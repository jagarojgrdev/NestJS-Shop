import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces';

//Declaramos por si en un futuro debemos de modificar el nombre, que sea de forma sencilla
export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) =>
  SetMetadata(META_ROLES, args);
