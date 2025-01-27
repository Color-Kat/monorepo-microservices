import { Inject, Injectable } from '@nestjs/common';
import { User } from '../models/user.model';
import { Model } from 'mongoose';
import { UserEntity } from '../entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) {}

    async findUserByEmail(email: string) {
        return this.userModel.findOne({email}).exec();
    }

    async findUserById(id: string) {
        return this.userModel.findById(id).exec();
    }

    async createUser(user: UserEntity) {
        const newUser = new this.userModel(user);
        return newUser.save()
    }

    async updateUser(user: UserEntity) {
        return this.userModel.updateOne({_id: user._id}, {
            $set: user
        }).exec();
    }

    async deleteUser(email: string) {
        return this.userModel.deleteOne({ email }).exec();
    }
}
