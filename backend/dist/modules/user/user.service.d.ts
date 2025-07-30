import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(userData: {
        username: string;
        email: string;
        password: string;
    }): Promise<User>;
    update(id: string, userData: Partial<User>): Promise<User>;
}
