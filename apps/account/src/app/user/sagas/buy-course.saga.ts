import { UserEntity } from '../entities/user.entity';
import { RMQService } from 'nestjs-rmq';
import { PurchaseState } from '@monorepo-microservices/interfaces';
import { BuyCourseSagaState } from './buy-course.state';
import { BuyCourseSagaStateStarted } from './buy-course.steps';

export class BuyCourseSaga {
    private state: BuyCourseSagaState;

    constructor(
        public user: UserEntity,
        public courseId: string,
        public readonly rmqService: RMQService // Pass it manually
    ) {}

    getState() {
        return this.state;
    }

    setState(state: PurchaseState, courseId: string) {
        switch (state) {
            case PurchaseState.Started:
                this.state = new BuyCourseSagaStateStarted();
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
