import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    AccountLogin,
    AccountRegister,
} from '@monorepo-microservices/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { JWTAuthGuard } from '../guards/jwt.guard';
import { UserId } from '../guards/user.decorator';

@Controller('users')
export class UserController {
    constructor() {
        //
    }

    @Get('ingo')
    @UseGuards(JWTAuthGuard)
    async getUserInfo(
        @UserId() userId: string
    ) {
        return userId;
    }
}
