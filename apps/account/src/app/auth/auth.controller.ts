import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IUser } from '@monorepo-microservices/interfaces';
import { ConfigService } from '@nestjs/config';


export class RegisterDto {
    email: string;
    password: string;
    displayName?: string;
}

export class LoginDto {
    email: string;
    password: string;
}

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
    }

    @Post('register')
    async register(@Body() dto: RegisterDto): Promise<IUser> {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        const { id } = await this.authService.validateUser(dto);

        return this.authService.login(id);
    }

    @Get()
    check () {
        return this.configService.get('JWT_SECRET');
    }
}
