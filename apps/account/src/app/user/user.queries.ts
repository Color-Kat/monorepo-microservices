import { Body, Controller, Get } from '@nestjs/common';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { AccountUserCourses, AccountUserInfo } from '@monorepo-microservices/contracts';
import { UserRepository } from './repositories/user.repository';
import { IUser } from '@monorepo-microservices/interfaces';
import { UserEntity } from './entities/user.entity';

@Controller('')
export class UserQueries {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly rmqService: RMQService
    ) {
    }

    @Get('health')
    async healthCheck() {
        const isRMQ = await this.rmqService.healthCheck();
        const user = await this.userRepository.healthCheck();

        return {
            "rmq": isRMQ ? 'up' : 'down',
            "user": user !== undefined ? 'up' : 'down',
            "status": isRMQ && user !== undefined ? 'up' : 'down'
        }
    }

    @RMQRoute(AccountUserInfo.topic)
    @RMQValidate()
    async userInfo(@Body() dto: AccountUserInfo.Request): Promise<AccountUserInfo.Response> {
        const user: IUser = await this.userRepository.findUserById(dto.id);
        const userEntity = new UserEntity(user);
        const profile = userEntity.getPublicProfile();

        return {
            profile
        };
    }

    @RMQRoute(AccountUserCourses.topic)
    @RMQValidate()
    async userCourses(@Body() dto: AccountUserCourses.Request): Promise<AccountUserCourses.Response> {
        const user = await this.userRepository.findUserById(dto.id);

        return {
            courses: user.courses
        };
    }
}
