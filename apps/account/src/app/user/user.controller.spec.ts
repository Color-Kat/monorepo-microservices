import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from '../configs/mongo.config';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { INestApplication } from '@nestjs/common';
import {
    AccountBuyCourse, AccountCheckPayment,
    AccountLogin,
    AccountRegister,
    AccountUserInfo,
    CourseGetCourse,
    PaymentCheck,
    PaymentGenerateLink,
    PaymentStatus
} from '@monorepo-microservices/contracts';
import { UserRepository } from './repositories/user.repository';
import { UserModule } from './user.module';
import { AuthModule } from '../auth/auth.module';
import { verify } from 'jsonwebtoken';

const authLogin: AccountLogin.Request = {
    email: 'test2@aa.aa',
    password: '123456',
};

const authRegister: AccountRegister.Request = {
    ...authLogin,
    displayName: 'Test User',
};

const courseId = 'courseId';

describe('UserController', () => {
    let app: INestApplication;
    let userRepository: UserRepository;
    let configService: ConfigService;
    let rmqService: RMQTestService;

    let token: string;
    let userId: string;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    // IDK why pwd in tests is different
                    envFilePath: '../../envs/.account.env',
                }),
                MongooseModule.forRootAsync(getMongoConfig()),
                RMQModule.forTest({}),
                UserModule,
                AuthModule,
            ],
        }).compile();

        app = module.createNestApplication();
        userRepository = app.get(UserRepository);
        configService = app.get(ConfigService);
        rmqService = app.get(RMQService);

        await app.init();

        // Register user
        await rmqService.triggerRoute<
            AccountRegister.Request,
            AccountRegister.Response
        >(AccountRegister.topic, authRegister);

        // Get access_token
        const { access_token } = await rmqService.triggerRoute<
            AccountLogin.Request,
            AccountLogin.Response
        >(AccountLogin.topic, authLogin);
        token = access_token;
        const data = verify(token, configService.get('JWT_SECRET'));
        userId = data['id'];
    });

    it('AccountUserInfo', async () => {
        const response = await rmqService.triggerRoute<
            AccountUserInfo.Request,
            AccountUserInfo.Response
        >(AccountUserInfo.topic, { id: userId });

        expect(response.profile.displayName).toEqual(authRegister.displayName);
    });

    it('BuyCourse Saga', async () => {
        const paymentLink = 'paymentLink';

        rmqService.mockReply<CourseGetCourse.Response>(CourseGetCourse.topic, {
            course: {
                _id: courseId,
                price: 100,
                description: 'description',
                preview: '',
                title: 'Title',
                videos: [],
            },
        });

        rmqService.mockReply<PaymentGenerateLink.Response>(
            PaymentGenerateLink.topic,
            { paymentLink }
        );

        // Buy Course
        const response = await rmqService.triggerRoute<
            AccountBuyCourse.Request,
            AccountBuyCourse.Response
        >(AccountBuyCourse.topic, {
            courseId,
            userId,
        });

        expect(response.paymentLink).toEqual(paymentLink);

        // Buy Course again - error
        await expect(
            rmqService.triggerRoute<
                AccountBuyCourse.Request,
                AccountBuyCourse.Response
            >(AccountBuyCourse.topic, {
                courseId,
                userId,
            })
        ).rejects.toThrowError();
    });

    it('BuyCourse Saga (Payment Check', async () => {
        // Check Payment (Purchased)
        rmqService.mockReply<PaymentCheck.Response>(
            PaymentCheck.topic, {
                status: PaymentStatus.Purchased
            }
        )

        const response2 = await rmqService.triggerRoute<
            AccountCheckPayment.Request,
            AccountCheckPayment.Response
        >(AccountCheckPayment.topic, {
            courseId,
            userId,
        });

        expect(response2.status).toEqual(PaymentStatus.Purchased);

        // Check user courses
        const response3 = await rmqService.triggerRoute<
            AccountUserInfo.Request,
            AccountUserInfo.Response
        >(AccountUserInfo.topic, { id: userId });

        expect(response3.profile.courses[0].courseId).toEqual(courseId);
    });


    afterAll(async () => {
        await userRepository.deleteUser(authRegister.email);
        app.close();
    });
});
