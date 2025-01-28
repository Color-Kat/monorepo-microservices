import { IsNumber, IsString } from 'class-validator';
import { IUser, PurchaseState } from '@monorepo-microservices/interfaces';

export enum PaymentStatus {
    Purchased = 'Purchased',
    WaitingForPayment = 'WaitingForPayment',
    Canceled = 'Canceled',
}

export namespace PaymentCheck {
    export const topic = 'payment.check.command';

    export class Request {
        @IsString()
        userId: string;

        @IsString()
        courseId: string;
    }

    export class Response {
        status: PaymentStatus;
    }
}
