import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const getJwtConfig = (): JwtModuleAsyncOptions => ({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const secret = configService.get('JWT_SECRET');

        if (!secret) throw new Error('JWT_SECRET is not defined');

        return {
            secret,
        };
    },
});
