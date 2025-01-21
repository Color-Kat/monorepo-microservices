import { MongooseModuleAsyncOptions, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const getMongoConfig = (): MongooseModuleAsyncOptions => ({
    useFactory: (configService: ConfigService) => ({
        uri:getMongoString(configService)
    }),
    inject: [ConfigService],
    imports: [ConfigModule],
});

const getMongoString = (configService: ConfigService) =>
    'mongodb://' +
    configService.get('MONGO_USER') +
    ':' +
    configService.get('MONGO_PASSWORD') +
    '@' +
    configService.get('MONGO_HOST') +
    ':' +
    configService.get('MONGO_PORT') +
    '/' +
    configService.get('MONGO_DATABASE') +
    '?authSource' +
    configService.get('MONGO_AUTH_DATABASE');
