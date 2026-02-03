import { Controller, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerDTO } from './DTO/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() registerDto: registerDTO) { 
        return this.authService.registerUser(
            registerDto.username,
            registerDto.email,
            registerDto.password
        );
    }
}