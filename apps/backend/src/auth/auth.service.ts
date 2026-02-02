import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm'; //Entity Manager
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(private readonly drizzleService: DrizzleService) {}

    async registerUser(username: string, email: string, password: string){

        //Check Already Exist
        const [UserExist] = await this.drizzleService.db.select().from(users).where(eq(users.email, email));

        if (UserExist) {
            throw new ConflictException('User already exists');
        }

        try {
            //Hash Password
            const salt = await bcrypt.genSalt(10);
            const HashPass = await bcrypt.hash(password, salt);

            //Inster USer
            const [NewUser] = await this.drizzleService.db
                .insert(users) //"users" table
                .values({
                    username: username,
                    email: email,
                    password: HashPass
                }).returning(); 

            return {message : 'Welcome to M-Verse, your account has been created', userId: NewUser.id, email: NewUser.email};
        } catch (e){
            throw new InternalServerErrorException('Error trying to create new user'); 
        }
    }

        
}
