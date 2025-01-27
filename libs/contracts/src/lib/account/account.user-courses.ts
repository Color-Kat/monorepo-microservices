import { IsEmail, IsString } from 'class-validator';
import { IUser, IUserCourses } from '@monorepo-microservices/interfaces';

export namespace AccountUserCourses {
    export const topic = 'account.user-courses.query';

    export class Request {
        @IsString()
        id: string;
    }

    export class Response {
        courses: IUserCourses[];
    }
}
