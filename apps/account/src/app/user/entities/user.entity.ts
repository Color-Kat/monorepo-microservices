import { IUser, IUserCourses, UserRole } from '@monorepo-microservices/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
    _id?: string;
    displayName?: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    courses?: IUserCourses[];

    constructor(user: IUser) {
        this._id = user._id;
        this.displayName = user.displayName;
        this.email = user.email;
        this.passwordHash = user.passwordHash;
        this.role = user.role;

        this.courses = user.courses;
    }

    /**
     * Generate and set password hash for from password.
     * @param password
     */
    public async setPassword(password: string): Promise<this> {
        const salt = await genSalt(10);
        this.passwordHash = await hash(password, salt);

        return this;
    }

    /**
     * Return true if the passed password is correct.
     * @param password
     */
    public validatePassword(password: string): Promise<boolean> {
        return compare(password, this.passwordHash);
    }
}
