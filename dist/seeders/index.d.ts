declare class DatabaseSeeder {
    private hashPassword;
    seedUsers(): Promise<void>;
    seedServiceCategories(): Promise<void>;
    seedServices(): Promise<void>;
    seedStylists(): Promise<void>;
    seedStylistSchedules(): Promise<void>;
    seedStylistServices(): Promise<void>;
    runAll(): Promise<void>;
    clearAll(): Promise<void>;
}
declare const _default: DatabaseSeeder;
export default _default;
//# sourceMappingURL=index.d.ts.map