import { Injectable } from '@nestjs/common';
import { IUser } from '@monorepo-microservices/interfaces';

@Injectable()
export class AppService {
    getData(): { message: string } {
        return { message: 'Hello API' };
    }

    getUser(): {user: IUser} {
        return {
            user: {
                name: '3123'
            }
        };
    }
}
