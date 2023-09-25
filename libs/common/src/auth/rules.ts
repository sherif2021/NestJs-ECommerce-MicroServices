import { SetMetadata } from '@nestjs/common';

export enum Rule {
    Admin = 'admin',
    Manager = 'manager',
}

export const RULES_KEY = 'rules';
export const Rules = (...rules: Rule[]) => SetMetadata(RULES_KEY, rules);
