import { UserEntity } from '../entities/user.entity';
import { RMQService } from 'nestjs-rmq';
import { PurchaseState } from '@monorepo-microservices/interfaces';
import { BuyCourseSagaState } from './buy-course.state';

export class BuyCourseSaga {
    private state: BuyCourseSagaState;

    constructor(
        private user: UserEntity,
        private courseId: string,
        private readonly rmqService: RMQService // Pass it manually
    ) {}

    getState() {
        return this.state;
    }

    setState(state: PurchaseState, courseId: string) {
        switch (state) {
            case PurchaseState.Started:
                break;
            case PurchaseState.WaitingForPayment:
                break;
            case PurchaseState.Purchased:
                break;
            case PurchaseState.Canceled:
                break;
            default:
                throw new Error('Invalid purchase state');
        }

        this.state.setContext(this);

        this.user.updateCoursePurchaceState(courseId, state);
    }
}
