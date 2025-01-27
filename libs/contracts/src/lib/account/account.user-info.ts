import { IsEmail, IsString } from 'class-validator';
import { IUser } from '@monorepo-microservices/interfaces';

export namespace AccountUserInfo {
    export const topic = 'account.user-info.query';

    export class Request {
        @IsString()
        id: string;
    }

    export class Response {
        user: Omit<IUser, 'passwordHash'>;
    }
}
