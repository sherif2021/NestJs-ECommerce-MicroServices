import { SetMetadata } from '@nestjs/common';

export enum Rule {
    Admin = 'admin',
    Manager = 'manager',
}

export const RULES_KEY = 'ruels';
export const Rules = (...ruels: Rule[]) => SetMetadata(RULES_KEY, ruels);
