declare class DatabaseSeeder {
    private hashPassword;
    seedUsers(): Promise<void>;
    seedServiceCategories(): Promise<void>;
    seedServices(): Promise<void>;
    seedStylists(): Promise<void>;
    seedStylistSchedules(): Promise<void>;
    seedServiceAddons(): Promise<void>;
    seedNotificationTemplates(): Promise<void>;
    seedSampleBookings(): Promise<void>;
    seedSamplePayments(): Promise<void>;
    seedSampleReviews(): Promise<void>;
    runAll(): Promise<void>;
    clearAll(): Promise<void>;
}
declare const _default: DatabaseSeeder;
export default _default;
//# sourceMappingURL=index.d.ts.map