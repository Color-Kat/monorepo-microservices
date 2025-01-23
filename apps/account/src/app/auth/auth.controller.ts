import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { AccountLogin, AccountRegister } from '@monorepo-microservices/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
    }

    @RMQRoute(AccountRegister.topic)
    @RMQValidate()
    async register(@Body() dto: AccountRegister.Request): Promise<AccountRegister.Response> {
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
