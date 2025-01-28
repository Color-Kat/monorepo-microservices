import { IsEmail, IsString } from 'class-validator';
import { IUser, PurchaseState } from '@monorepo-microservices/interfaces';

export namespace AccountChangedCourse {
    export const topic = 'account.changed-course.event';

    export class Request {
        @IsString()
        userId: string;

        @IsString()
        courseId: string;

        @IsString()
        state: PurchaseState;
    }
}
