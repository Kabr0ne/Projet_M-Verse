import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: 'Rules for user registration' })
export class registerDTO {
    @IsString()
    @ApiProperty()
    username: string;

    @IsEmail({}, { message: 'Invalid email'})
    @ApiProperty({ description: 'Email must be valid'})
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be 8 characters or longer'})
    @ApiProperty({ description: 'Password must be 8 characters or longer'})
    password: string;
}
