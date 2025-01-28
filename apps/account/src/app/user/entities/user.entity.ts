import {
    IUser,
    IUserCourses,
    PurchaseState,
    UserRole,
} from '@monorepo-microservices/interfaces';
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
     * Return public profile object of the user info.
     */
    public getPublicProfile() {
        return {
            email: this.email,
            role: this.role,
            displayName: this.displayName,
        };
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

    /**
     * Update user data.
     *
     * @param data
     */
    public updateProfile(data: Pick<IUser, 'displayName'>) {
        this.displayName = data.displayName;

        return this;
    }

    /**
     * Change course purchase state
     *
     * @param courseId
     * @param state
     */
    public setCoursePurchaseState(courseId: string, state: PurchaseState) {
        const existingCourse = this.courses.find(
            (course) => course._id === courseId
        );

        if (!existingCourse) {
            this.courses.push({
                courseId,
                purchaseState: state,
            });
            return this;
        }

        if (state == PurchaseState.Canceled) {
            this.courses = this.courses.filter((course) => course._id !== courseId);
            return this;
        }

        this.courses = this.courses.map((course) => {
            if (course._id == courseId) course.purchaseState = state;

            return course;
        });

        return this;
    }
}
