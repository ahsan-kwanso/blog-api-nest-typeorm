import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/user/dto/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/*
ReflectMetadata

    Purpose: The ReflectMetadata decorator (now deprecated in favor of Reflect.defineMetadata and Reflect.getMetadata) was primarily used to attach metadata to classes and methods, similar to SetMetadata. It relies on the Reflect API to store metadata.
    Usage: It could be used to retrieve metadata using the Reflect API, but its usage has largely been superseded by SetMetadata in the NestJS ecosystem.
 */
