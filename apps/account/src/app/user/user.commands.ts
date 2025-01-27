import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { AccountChangeProfile } from '@monorepo-microservices/contracts';
import { NotFoundError } from 'rxjs';
import { UserEntity } from './entities/user.entity';

@Controller()
export class UserCommands {
    constructor(
        private readonly userRepository: UserRepository,
    ) {
    }

    @RMQRoute(AccountChangeProfile.topic)
    @RMQValidate()
    async userInfo(@Body() dto: AccountChangeProfile.Request): Promise<AccountChangeProfile.Response> {
        const existedUser = await this.userRepository.findUserById(dto.id);

        if(!existedUser) throw new NotFoundError('User not found')

        const userEntity = new UserEntity(existedUser).updateProfile(
            dto.user
        );

        const result = await this.userRepository.updateUser(userEntity)

        return {};
    }
}
