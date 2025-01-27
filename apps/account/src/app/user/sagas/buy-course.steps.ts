import { BuyCourseSagaState } from './buy-course.state';
import { UserEntity } from '../entities/user.entity';
import {
    CourseGetCourse,
    PaymentGenerateLink,
} from '@monorepo-microservices/contracts';
import { PurchaseState } from '@monorepo-microservices/interfaces';

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

    public checkPayment(): Promise<{ user: UserEntity }> {
        throw new Error(`Can't check the payment that hasn't been started yet`);
    }

    public async cancel(): Promise<{ user: UserEntity }> {
        this.saga.setState(PurchaseState.Canceled, this.saga.courseId);

        return {user: this.saga.user}
    }
}
