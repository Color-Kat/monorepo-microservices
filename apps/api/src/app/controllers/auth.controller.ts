import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    AccountLogin,
    AccountRegister,
} from '@monorepo-microservices/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';

@Controller('auth')
export class AuthController {
    constructor() {
        //
    }

    @Post('register')
    async register(
        @Body() dto: AccountRegister.Request
    ): Promise<AccountRegister.Response> {

    }

    @Post('login')
    async login(
        @Body() dto: AccountLogin.Request
    ): Promise<AccountLogin.Response> {

    }
}
