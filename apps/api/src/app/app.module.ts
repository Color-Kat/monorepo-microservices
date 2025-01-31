import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './configs/rmq.config';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from './configs/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './controllers/user.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ConfigModule.forRoot({ envFilePath: 'envs/.api.env', isGlobal: true }),
        RMQModule.forRootAsync(getRMQConfig()),
        JwtModule.registerAsync(getJwtConfig()),
        PassportModule,
        ScheduleModule.forRoot()
    ],
    providers: [JwtStrategy],
    controllers: [
        AuthController,
        UserController
    ],
})
export class AppModule {}
