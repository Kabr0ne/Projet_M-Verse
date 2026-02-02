import { IsEmail, IsString, MinLength } from 'class-validator';

export class registerDTO {
    @IsString()
    username: string;

    @IsEmail({}, { message: 'Invalid email'})
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be 8 characters or longer'})
    password: string;
}
