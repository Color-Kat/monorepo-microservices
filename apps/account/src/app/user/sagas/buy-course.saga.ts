import { UserEntity } from '../entities/user.entity';
import { RMQService } from 'nestjs-rmq';
import { PurchaseState } from '@monorepo-microservices/interfaces';
import { BuyCourseSagaState } from './buy-course.state';
import {
    BuyCourseSagaStateCanceled,
    BuyCourseSagaStatePurchased,
    BuyCourseSagaStateWaitingForPayment,
    BuyCourseSagaStateStarted
} from './buy-course.steps';
import { Promise } from 'mongoose';

export class BuyCourseSaga {
    private state: BuyCourseSagaState;

    constructor(
        public user: UserEntity,
        public courseId: string,
        public readonly rmqService: RMQService // Pass it manually
    ) {
        this.setState(user.getCourseState(courseId), courseId);
    }

    getState() {
        return this.state;
    }

    setState(state: PurchaseState, courseId: string) {
        switch (state) {
            case PurchaseState.Started:
                this.state = new BuyCourseSagaStateStarted();
                break;
            case PurchaseState.WaitingForPayment:
                this.state = new BuyCourseSagaStateWaitingForPayment();
                break;
            case PurchaseState.Purchased:
                this.state = new BuyCourseSagaStatePurchased();
                break;
            case PurchaseState.Canceled:
                this.state = new BuyCourseSagaStateCanceled();
                break;
            default:
                throw new Error('Invalid purchase state');
        }

        this.state.setContext(this);

        this.user.setCoursePurchaseState(courseId, state);
    }
}

