import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import {
    AccountBuyCourse,
    AccountChangeProfile,
    AccountCheckPayment,
} from '@monorepo-microservices/contracts';
import { NotFoundError } from 'rxjs';
import { UserEntity } from './entities/user.entity';
import { IUser } from '@monorepo-microservices/interfaces';
import { BuyCourseSaga } from './sagas/buy-course.saga';

@Controller()
export class UserCommands {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly rmqService: RMQService
    ) {}

    @RMQRoute(AccountChangeProfile.topic)
    @RMQValidate()
    async userInfo(
        @Body() dto: AccountChangeProfile.Request
    ): Promise<AccountChangeProfile.Response> {
        const existedUser = await this.userRepository.findUserById(dto.id);

        if (!existedUser) throw new NotFoundError('User not found');

        const userEntity = new UserEntity(existedUser).updateProfile(dto.user);

        const result = await this.userRepository.updateUser(userEntity);

        return {};
    }

    @RMQRoute(AccountBuyCourse.topic)
    @RMQValidate()
    async buyCourse(
        @Body() dto: AccountBuyCourse.Request
    ): Promise<AccountBuyCourse.Response> {
        const existedUser = await this.userRepository.findUserById(dto.userId);
        if (!existedUser) throw new NotFoundError('User not found');

        const userEntity = new UserEntity(existedUser);
        const saga = new BuyCourseSaga(
            userEntity,
            dto.courseId,
            this.rmqService
        );

        // User was updated
        const { user, paymentLink } = await saga.getState().pay();
        await this.userRepository.updateUser(user);

        return { paymentLink };
    }

    @RMQRoute(AccountCheckPayment.topic)
    @RMQValidate()
    async checkPayment(
        @Body() dto: AccountCheckPayment.Request
    ): Promise<AccountCheckPayment.Response> {
        const existedUser = await this.userRepository.findUserById(dto.userId);
        if (!existedUser) throw new NotFoundError('User not found');

        const userEntity = new UserEntity(existedUser);

        const saga = new BuyCourseSaga(
            userEntity,
            dto.courseId,
            this.rmqService
        );

        const { user, status } = await saga.getState().checkPayment();
        await this.userRepository.updateUser(user);

        return { status };
    }
}
