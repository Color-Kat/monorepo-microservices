import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '../user/repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '../configs/jwt.config';

@Module({
    imports: [
        UserRepository,
        JwtModule.register(getJwtConfig())
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
