import { Body, Injectable } from '@nestjs/common';
import { NotFoundError } from 'rxjs';
import { UserEntity } from './entities/user.entity';
import { RMQService } from 'nestjs-rmq';
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { IUser } from '@monorepo-microservices/interfaces';
import { UserRepository } from './repositories/user.repository';
import { UserEventEmitter } from './user.event-emitter';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly rmqService: RMQService,
        private readonly userEventEmitter: UserEventEmitter
    ) {}

    public async changeProfile(user: Pick<IUser, 'displayName'>, id: string){
        const existedUser = await this.userRepository.findUserById(id);

        if (!existedUser) throw new NotFoundError('User not found');

        const userEntity = new UserEntity(existedUser).updateProfile(user);

        const result = await this.updateUser(userEntity);

        return {};
    }

    public async buyCourse(
        userId: string,
        courseId: string
    ) {
        const existedUser = await this.userRepository.findUserById(userId);
        if (!existedUser) throw new NotFoundError('User not found');

        const userEntity = new UserEntity(existedUser);
        const saga = new BuyCourseSaga(
            userEntity,
            courseId,
            this.rmqService
        );

        // User was updated
        const { user, paymentLink } = await saga.getState().pay();
        await this.updateUser(user);

        return { paymentLink };
    }

    public async checkPayment(
        userId: string,
        courseId: string
    ) {
        const existedUser = await this.userRepository.findUserById(userId);
        if (!existedUser) throw new NotFoundError('User not found');

        const userEntity = new UserEntity(existedUser);

        const saga = new BuyCourseSaga(
            userEntity,
            courseId,
            this.rmqService
        );

        const { user, status } = await saga.getState().checkPayment();
        await this.updateUser(user);

        return { status };
    }

    /**
     * Update user data using repository.
     * And additionally emit events about changes.
     * @param userEntity
     * @private
     */
    private updateUser(
        userEntity: UserEntity
    ) {
        return Promise.all([
            this.userEventEmitter.handle(userEntity),
            this.userRepository.updateUser(userEntity)
        ]);
    }
}
