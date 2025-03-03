import { BuyCourseSaga } from './buy-course.saga';
import { UserEntity } from '../entities/user.entity';
import { PurchaseState } from '@monorepo-microservices/interfaces';
import { PaymentStatus } from '@monorepo-microservices/contracts';

export abstract class BuyCourseSagaState {
    public saga: BuyCourseSaga;

    public setContext(saga: BuyCourseSaga) {
        this.saga = saga;
    }

    public abstract pay(): Promise<{ paymentLink: string; user: UserEntity }>;

    public abstract checkPayment(): Promise<{ user: UserEntity, status: PaymentStatus }>;

    public abstract cancel(): Promise<{ user: UserEntity }>;
}
