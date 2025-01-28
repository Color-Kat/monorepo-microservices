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
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { UserService } from './user.service';

@Controller()
export class UserCommands {
    constructor(
        private readonly userService: UserService,
        private readonly userRepository: UserRepository,
        private readonly rmqService: RMQService
    ) {}

    @RMQRoute(AccountChangeProfile.topic)
    @RMQValidate()
    async changeProfile(
        @Body() dto: AccountChangeProfile.Request
    ): Promise<AccountChangeProfile.Response> {
        return this.userService.changeProfile(dto.user, dto.id);
    }

    @RMQRoute(AccountBuyCourse.topic)
    @RMQValidate()
    async buyCourse(
        @Body() dto: AccountBuyCourse.Request
    ): Promise<AccountBuyCourse.Response> {
        return this.userService.buyCourse(dto.userId, dto.courseId);
    }

    @RMQRoute(AccountCheckPayment.topic)
    @RMQValidate()
    async checkPayment(
        @Body() dto: AccountCheckPayment.Request
    ): Promise<AccountCheckPayment.Response> {
        return this.userService.checkPayment(dto.userId, dto.courseId);
    }
}
