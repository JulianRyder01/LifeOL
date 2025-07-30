import { AuthService } from './auth.service';
import { Request } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    login(req: Request): Promise<{
        user: {
            id: string;
            username: string;
            email: string;
            avatar: string;
            createdAt: Date;
        };
        token: string;
    }>;
    refresh(req: Request): Promise<{
        token: string;
        refreshToken: string;
    }>;
}
