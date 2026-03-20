import { Controller, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerDTO } from './DTO/register.dto';
import { loginDTO } from './DTO/login.dto';
import { ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import { UseGuards, Get, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Authentication')  
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ 
        summary: 'Register a new user', 
        description: 'Creates a new user account with the provided username, email, and password.',
        responses: {
            201: { description: 'User successfully registered' },
            400: { description: 'Invalid input data' },
        },
    })
    async register(@Body() registerDto: registerDTO) { 
        return this.authService.registerUser(
            registerDto.username,
            registerDto.email,
            registerDto.password
        );
    }

    @Post('login')
    @ApiOperation({
        summary: 'Login a user',
        description: 'Authenticates a user with the provided email and password.',
        responses: {
            200: { description: 'User successfully logged in' },
            401: { description: 'Invalid login credentials' },
        },
    })
    async login(@Body() loginDto: loginDTO) {
        return this.authService.loginUser(
            loginDto.email,
            loginDto.password
        );
    }

    @ApiBearerAuth('JWT-authorization')
    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    @ApiOperation({ summary: 'Get user profile', 
        description: 'Retrieves the profile of the authenticated user.' 
    })
    getProfile(@Request() req) {
        return req.user;
    }

    
}