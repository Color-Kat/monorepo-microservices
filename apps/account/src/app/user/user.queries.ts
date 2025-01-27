import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { AccountUserCourses, AccountUserInfo } from '@monorepo-microservices/contracts';
import { UserRepository } from './repositories/user.repository';
import { IUser } from '@monorepo-microservices/interfaces';

@Controller()
export class UserQueries {
    constructor(
        private readonly userRepository: UserRepository,
    ) {
    }

    @RMQRoute(AccountUserInfo.topic)
    @RMQValidate()
    async userInfo(@Body() dto: AccountUserInfo.Request): Promise<AccountUserInfo.Response> {
        const user: IUser = await this.userRepository.findUserById(dto.id);
        delete user.passwordHash;

        return {user};
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
