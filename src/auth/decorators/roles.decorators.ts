import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

export const ROLES_KEY = 'roles';

// -> roles decorator markes the routes with the roles
// -> roles guard will later reads this metadata to check if the user has permission

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
