import { Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    AccountLogin,
    AccountRegister,
} from '@monorepo-microservices/contracts';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

import * as uuid from 'uuid';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly rmqService: RMQService
    ) {}

    @Post('register')
    async register(
        @Body() dto: RegisterDto
    ): Promise<AccountRegister.Response> {
        try {
            return await this.rmqService.send<AccountRegister.Request, AccountRegister.Response>(
                AccountRegister.topic,
                dto,
                {
                    headers: {
                        requestId: uuid.v4()
                    }
                }
            )
        } catch (error) {
            if(error instanceof Error)
                throw new UnauthorizedException(error.message);
        }
    }

    @Post('login')
    async login(
        @Body() dto: LoginDto
    ): Promise<AccountLogin.Response> {
        try {
            return await this.rmqService.send<AccountLogin.Request, AccountLogin.Response>(
                AccountLogin.topic,
                dto
            )
        } catch (error) {
            if(error instanceof Error)
                throw new UnauthorizedException(error.message);
        }
    }
}
