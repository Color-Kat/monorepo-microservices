import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IUser } from '@monorepo-microservices/interfaces';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
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
}

export class RegisterDto {
    email: string;
    password: string;
    displayName?: string;
}

export class LoginDto {
    email: string;
    password: string;
}
