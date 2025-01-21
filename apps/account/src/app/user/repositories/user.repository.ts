import { Inject, Injectable } from '@nestjs/common';
import { User } from '../models/user.model';
import { Model } from 'mongoose';
import { UserEntity } from '../entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) {
        console.log(User.name, this.toString());
    }

    async createUser(user: UserEntity) {
        const newUser = new this.userModel(user);
        return newUser.save()
    }

    async findUser(email: string) {
        return this.userModel.findOne({email}).exec();
    }

    async deleteUser(email: string) {
        return this.userModel.deleteOne({ email }).exec();
    }
}
