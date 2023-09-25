import { Rule } from "@app/common";

export class UserAuth {

    id: string;

    rules: Rule[];
}

export class RefreshTokenUserAuth {

    id: string;

    email: string;

    password: string;
}
