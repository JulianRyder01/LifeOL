import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../../entities/user.entity';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private userService;
    private jwtService;
    private configService;
    constructor(userService: UserService, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: User): Promise<{
        user: {
            id: string;
            username: string;
            email: string;
            avatar: string;
            createdAt: Date;
        };
        token: string;
    }>;
    register(userData: {
        username: string;
        email: string;
        password: string;
    }): Promise<{
        user: {
            id: string;
            username: string;
            email: string;
            avatar: string;
            createdAt: Date;
        };
        token: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        token: string;
        refreshToken: string;
    }>;
}
