import { BuyCourseSagaState } from './buy-course.state';
import { UserEntity } from '../entities/user.entity';
import {
    CourseGetCourse,
    PaymentCheck,
    PaymentGenerateLink,
    PaymentStatus,
} from '@monorepo-microservices/contracts';
import { PurchaseState } from '@monorepo-microservices/interfaces';
import { Error } from 'mongoose';

export class BuyCourseSagaStateStarted extends BuyCourseSagaState {
    public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
        const { course } = await this.saga.rmqService.send<
            CourseGetCourse.Request,
            CourseGetCourse.Response
        >(CourseGetCourse.topic, { id: this.saga.courseId });

        if (!course) throw new Error(`This course doesn't exist`);

        // This is free course
        if (course.price === 0) {
            this.saga.setState(PurchaseState.Purchased, course._id);

            return { paymentLink: null, user: this.saga.user };
        }

        // If course is not free, send command to Payment microservice
        const { paymentLink } = await this.saga.rmqService.send<
            PaymentGenerateLink.Request,
            PaymentGenerateLink.Response
        >(PaymentGenerateLink.topic, {
            courseId: course._id,
            sum: course.price,
            userId: this.saga.user._id,
        });

        this.saga.setState(PurchaseState.WaitingForPayment, course._id);

        return {
            paymentLink,
            user: this.saga.user,
        };
    }

    checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
        throw new Error(`Can't check the payment that hasn't been started yet`);
    }

    public async cancel(): Promise<{ user: UserEntity }> {
        this.saga.setState(PurchaseState.Canceled, this.saga.courseId);

        return { user: this.saga.user };
    }
}

export class BuyCourseSagaStateWaitingForPayment extends BuyCourseSagaState {
    public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
        throw new Error('Payment is already in progress');
    }

    public async checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
        const { status } = await this.saga.rmqService.send<
            PaymentCheck.Request,
            PaymentCheck.Response
        >(PaymentCheck.topic, {
            courseId: this.saga.courseId,
            userId: this.saga.user._id,
        });

        if (status === PaymentStatus.Canceled)
            this.saga.setState(PurchaseState.Canceled, this.saga.courseId);

        if (status === PaymentStatus.Purchased)
            this.saga.setState(PurchaseState.Purchased, this.saga.courseId);

        return {
            user: this.saga.user,
            status
        };
    }

    public async cancel(): Promise<{ user: UserEntity }> {
        throw new Error(`Can't cancel the payment that is in progress`);
    }
}

export class BuyCourseSagaStatePurchased extends BuyCourseSagaState {
    public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
        throw new Error('The course is already purchased');
    }

    public async checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
        throw new Error('The course is already purchased');
    }

    public async cancel(): Promise<{ user: UserEntity }> {
        throw new Error('The course is already purchased');
    }
}

export class BuyCourseSagaStateCanceled extends BuyCourseSagaState {
    public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
        this.saga.setState(PurchaseState.Started, this.saga.courseId);

        return this.saga.getState().pay();
    }

    public async checkPayment(): Promise<{ user: UserEntity, status: PaymentStatus }> {
        throw new Error('The course is already canceled');
    }

    public async cancel(): Promise<{ user: UserEntity }> {
        throw new Error('The course is already canceled');
    }
}
