import { Injectable } from '@nestjs/common';
import { LoginDto, RegisterDto } from './auth.controller';
import { UserRepository } from '../user/repositories/user.repository';
import { UserEntity } from '../user/entities/user.entity';
import { IUser, UserRole } from '@monorepo-microservices/interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService
    ) {}

    /**
     * Create new user in db.
     * - Ensure that user with the same email does not exist.
     * - Generate password hash.
     *
     * @param email
     * @param password
     * @param displayName
     */
    async register({ email, password, displayName }: RegisterDto): Promise<IUser> {
        const oldUser = await this.userRepository.findUser(email);
        if (oldUser) throw new Error('This user already exists');

        const newUserEntity = await new UserEntity({
            email,
            passwordHash: '',
            displayName,
            role: UserRole.Student,
        }).setPassword(password);

        const newUser = await this.userRepository.createUser(newUserEntity);

        return newUser;
    }

    async validateUser({ email, password }: LoginDto): Promise<{id: string}> {
        const user = await this.userRepository.findUser(email);
        if (!user) throw new Error('Wrong email or password');

        const userEntity = new UserEntity(user);
        const isPasswordCorrect = await userEntity.validatePassword(password);

        if(!isPasswordCorrect) throw new Error('Wrong email or password');

        return {
            id: user._id
        }
    }

    async login(id: string) {
        return {
            access_token: await this.jwtService.signAsync({
                id
            })
        };
    }
}
