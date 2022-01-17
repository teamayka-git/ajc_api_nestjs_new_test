import { SetMetadata } from '@nestjs/common';

export const Roles =(role)=>SetMetadata('roles',role);
