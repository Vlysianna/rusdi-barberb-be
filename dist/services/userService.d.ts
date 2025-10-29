import { type User } from "../models/user";
import { UserRole } from "../utils/types";
interface GetUsersParams {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
interface SearchUsersParams {
    query: string;
    page: number;
    limit: number;
}
interface UserActivity {
    id: string;
    action: string;
    timestamp: Date;
    details?: any;
}
interface GetUserActivityResult {
    activities: UserActivity[];
    total: number;
}
interface GetUsersResult {
    users: Omit<User, "password">[];
    total: number;
}
interface UserStats {
    totalUsers: number;
    activeUsers: number;
    usersByRole: {
        admin: number;
        stylist: number;
        customer: number;
    };
    newUsersThisMonth: number;
    newUsersToday: number;
    verifiedUsers: number;
    unverifiedUsers: number;
}
declare class UserService {
    private readonly saltRounds;
    private sanitizeUser;
    private hashPassword;
    getUsers(params: GetUsersParams): Promise<GetUsersResult>;
    getUserById(userId: string): Promise<Omit<User, "password"> | null>;
    createUser(userData: {
        email: string;
        password: string;
        fullName: string;
        phone?: string;
        role?: UserRole;
        dateOfBirth?: Date;
        gender?: "male" | "female";
        address?: string;
        preferences?: string;
    }): Promise<Omit<User, "password">>;
    updateUser(userId: string, updateData: {
        fullName?: string;
        phone?: string;
        dateOfBirth?: Date;
        gender?: "male" | "female";
        address?: string;
        preferences?: string;
        isActive?: boolean;
        emailVerified?: boolean;
        role?: UserRole;
    }): Promise<Omit<User, "password">>;
    deleteUser(userId: string): Promise<void>;
    uploadAvatar(userId: string, file: any): Promise<Omit<User, "password">>;
    getUserStats(): Promise<UserStats>;
    bulkUpdateUsers(userIds: string[], updateData: any): Promise<number>;
    searchUsers(params: SearchUsersParams): Promise<GetUsersResult>;
    getUserActivity(userId: string, params: {
        page: number;
        limit: number;
    }): Promise<GetUserActivityResult>;
    exportUsers(format: string): Promise<string>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=userService.d.ts.map