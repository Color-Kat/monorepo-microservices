import { IsNumber, IsString } from 'class-validator';
import { IUser } from '@monorepo-microservices/interfaces';

export namespace PaymentGenerateLink {
    export const topic = 'payment.generate-link.command';

    export class Request {
        @IsString()
        userId: string;

        @IsString()
        courseId: string;

        @IsNumber()
        sum: number;
    }

    export class Response {
        paymentLink: string;
    }
}
