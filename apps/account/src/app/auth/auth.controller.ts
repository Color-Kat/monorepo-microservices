import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { AccountLogin, AccountRegister } from '@monorepo-microservices/contracts';
import { Message, RMQMessage, RMQRoute, RMQValidate } from 'nestjs-rmq';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
    }

    @RMQRoute(AccountRegister.topic)
    @RMQValidate()
    async register(
        @Body() dto: AccountRegister.Request,
        @RMQMessage message: Message
    ): Promise<AccountRegister.Response> {
        const rid = message.properties.headers['requestId'];
        const logger = new Logger(rid);
        logger.log('New registration, request id: ' + rid);
        return this.authService.register(dto);
    }

    @RMQRoute(AccountLogin.topic)
    @RMQValidate()
    async login(@Body() dto: AccountLogin.Request): Promise<AccountLogin.Response> {
        const { id } = await this.authService.validateUser(dto);

        return this.authService.login(id);
    }

    @Get()
    check () {
        return this.configService.get('JWT_SECRET');
    }
}
