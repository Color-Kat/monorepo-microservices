import { IsEmail, IsString } from 'class-validator';
import { IUser, PurchaseState } from '@monorepo-microservices/interfaces';
import { PaymentStatus } from '../payment/payment.check';

export namespace AccountCheckPayment {
    export const topic = 'account.check-payment.command';

    export class Request {
        @IsString()
        userId: string;

        @IsString()
        courseId: string;
    }

    export class Response {
        status: PaymentStatus
    }
}
