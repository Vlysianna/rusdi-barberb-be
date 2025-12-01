"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const user_1 = require("../models/user");
const stylist_1 = require("../models/stylist");
const service_1 = require("../models/service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const drizzle_orm_1 = require("drizzle-orm");
class DatabaseSeeder {
    async hashPassword(password) {
        return await bcryptjs_1.default.hash(password, 12);
    }
    async seedUsers() {
        console.log("🌱 Seeding users...");
        const usersData = [
            {
                email: "admin@rusdibarber.com",
                password: await this.hashPassword("SuperAdmin123!"),
                fullName: "Super Admin",
                phone: "081234567890",
                role: "admin",
                isActive: true,
                emailVerified: true,
                emailVerifiedAt: new Date(),
            },
            {
                email: "manager@rusdibarber.com",
                password: await this.hashPassword("Manager123!"),
                fullName: "Branch Manager",
                phone: "081234567891",
                role: "manager",
                isActive: true,
                emailVerified: true,
                emailVerifiedAt: new Date(),
            },
            {
                email: "ahmad@rusdibarber.com",
                password: await this.hashPassword("Stylist123!"),
                fullName: "Ahmad Rizki",
                phone: "081234567892",
                role: "stylist",
                isActive: true,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                dateOfBirth: new Date("1990-05-15"),
                gender: "male",
                address: "Jl. Sudirman No. 123, Jakarta",
            },
            {
                email: "budi@rusdibarber.com",
                password: await this.hashPassword("Stylist123!"),
                fullName: "Budi Santoso",
                phone: "081234567893",
                role: "stylist",
                isActive: true,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                dateOfBirth: new Date("1988-08-20"),
                gender: "male",
                address: "Jl. Thamrin No. 456, Jakarta",
            },
            {
                email: "sari@rusdibarber.com",
                password: await this.hashPassword("Stylist123!"),
                fullName: "Sari Dewi",
                phone: "081234567894",
                role: "stylist",
                isActive: true,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                dateOfBirth: new Date("1992-03-10"),
                gender: "female",
                address: "Jl. Gatot Subroto No. 789, Jakarta",
            },
        ];
        await database_1.db.insert(user_1.users).values(usersData);
        console.log("✅ Users seeded successfully");
    }
    async seedServiceCategories() {
        console.log("🌱 Seeding service categories...");
        const categoriesData = [
            {
                name: "Haircut",
                description: "Layanan potong rambut profesional",
                icon: "scissors",
                sortOrder: 1,
                isActive: true,
            },
            {
                name: "Beard & Mustache",
                description: "Layanan cukur dan perawatan jenggot/kumis",
                icon: "beard",
                sortOrder: 2,
                isActive: true,
            },
            {
                name: "Hair Wash",
                description: "Layanan cuci rambut dan perawatan kulit kepala",
                icon: "water-drop",
                sortOrder: 3,
                isActive: true,
            },
            {
                name: "Styling",
                description: "Layanan penataan rambut",
                icon: "hair-dryer",
                sortOrder: 4,
                isActive: true,
            },
            {
                name: "Coloring",
                description: "Layanan pewarnaan rambut",
                icon: "palette",
                sortOrder: 5,
                isActive: true,
            },
            {
                name: "Treatment",
                description: "Layanan perawatan rambut khusus",
                icon: "treatment",
                sortOrder: 6,
                isActive: true,
            },
        ];
        await database_1.db.insert(service_1.serviceCategories).values(categoriesData);
        console.log("✅ Service categories seeded successfully");
    }
    async seedServices() {
        console.log("🌱 Seeding services...");
        const servicesData = [
            {
                name: "Potong Rambut Pria",
                description: "Potong rambut pria dengan gaya klasik atau modern",
                category: "haircut",
                price: "50000.00",
                duration: 30,
                isActive: true,
                isPopular: true,
            },
            {
                name: "Potong Rambut Anak",
                description: "Potong rambut untuk anak-anak (di bawah 12 tahun)",
                category: "haircut",
                price: "35000.00",
                duration: 20,
                isActive: true,
            },
            {
                name: "Potong Rambut Premium",
                description: "Potong rambut dengan konsultasi dan styling lengkap",
                category: "haircut",
                price: "75000.00",
                duration: 45,
                isActive: true,
                isPopular: true,
            },
            {
                name: "Cukur Jenggot",
                description: "Cukur dan rapikan jenggot dengan hot towel",
                category: "beard_trim",
                price: "30000.00",
                duration: 20,
                isActive: true,
            },
            {
                name: "Cukur Kumis",
                description: "Rapikan dan bentuk kumis",
                category: "beard_trim",
                price: "20000.00",
                duration: 15,
                isActive: true,
            },
            {
                name: "Cuci Rambut",
                description: "Cuci rambut dengan shampo dan kondisioner premium",
                category: "hair_wash",
                price: "25000.00",
                duration: 15,
                isActive: true,
            },
            {
                name: "Creambath",
                description: "Perawatan rambut dengan creambath dan pijat kepala",
                category: "hair_wash",
                price: "60000.00",
                duration: 45,
                isActive: true,
                isPopular: true,
            },
            {
                name: "Hair Styling",
                description: "Penataan rambut untuk acara khusus",
                category: "styling",
                price: "40000.00",
                duration: 25,
                isActive: true,
            },
            {
                name: "Pewarnaan Rambut",
                description: "Pewarnaan rambut full dengan cat premium",
                category: "coloring",
                price: "150000.00",
                duration: 90,
                isActive: true,
            },
            {
                name: "Highlight",
                description: "Pewarnaan highlight untuk tampilan dimensional",
                category: "coloring",
                price: "200000.00",
                duration: 120,
                isActive: true,
            },
            {
                name: "Hair Mask",
                description: "Perawatan masker rambut untuk rambut rusak",
                category: "treatment",
                price: "80000.00",
                duration: 45,
                isActive: true,
            },
            {
                name: "Scalp Treatment",
                description: "Perawatan kulit kepala untuk rambut sehat",
                category: "treatment",
                price: "100000.00",
                duration: 60,
                isActive: true,
            },
        ];
        await database_1.db.insert(service_1.services).values(servicesData);
        console.log("✅ Services seeded successfully");
    }
    async seedStylists() {
        console.log("🌱 Seeding stylists...");
        const stylistUsers = await database_1.db
            .select()
            .from(user_1.users)
            .where((0, drizzle_orm_1.eq)(user_1.users.role, "stylist"));
        const stylistsData = [
            {
                userId: stylistUsers[0].id,
                specialties: ["Potong Rambut Pria", "Cukur Jenggot", "Fade Cut"],
                experience: 5,
                rating: "4.80",
                totalReviews: 120,
                isAvailable: true,
                bio: "Barber profesional dengan 5 tahun pengalaman, spesialis potong rambut pria dan fade cut.",
            },
            {
                userId: stylistUsers[1].id,
                specialties: ["Hair Styling", "Pewarnaan", "Modern Cut"],
                experience: 3,
                rating: "4.60",
                totalReviews: 85,
                isAvailable: true,
                bio: "Stylist kreatif dengan keahlian pewarnaan dan styling modern.",
            },
            {
                userId: stylistUsers[2].id,
                specialties: ["Creambath", "Hair Treatment", "Hair Mask"],
                experience: 4,
                rating: "4.90",
                totalReviews: 150,
                isAvailable: true,
                bio: "Spesialis perawatan rambut dan treatment dengan teknik massage relaksasi.",
            },
        ];
        await database_1.db.insert(stylist_1.stylists).values(stylistsData);
        console.log("✅ Stylists seeded successfully");
    }
    async seedStylistSchedules() {
        console.log("🌱 Seeding stylist schedules...");
        const allStylists = await database_1.db.select().from(stylist_1.stylists);
        const scheduleData = [];
        for (const stylist of allStylists) {
            for (let day = 1; day <= 6; day++) {
                scheduleData.push({
                    stylistId: stylist.id,
                    dayOfWeek: day,
                    startTime: "09:00:00",
                    endTime: "21:00:00",
                    isAvailable: true,
                });
            }
            scheduleData.push({
                stylistId: stylist.id,
                dayOfWeek: 0,
                startTime: "10:00:00",
                endTime: "18:00:00",
                isAvailable: true,
            });
        }
        await database_1.db.insert(stylist_1.stylistSchedules).values(scheduleData);
        console.log("✅ Stylist schedules seeded successfully");
    }
    async seedStylistServices() {
        console.log("🌱 Seeding stylist services...");
        const allStylists = await database_1.db.select().from(stylist_1.stylists);
        const allServices = await database_1.db.select().from(service_1.services);
        const stylistServicesData = [];
        for (const stylist of allStylists) {
            for (const service of allServices) {
                stylistServicesData.push({
                    stylistId: stylist.id,
                    serviceId: service.id,
                });
            }
        }
        await database_1.db.insert(stylist_1.stylistServices).values(stylistServicesData);
        console.log("✅ Stylist services seeded successfully");
    }
    async runAll() {
        try {
            console.log("🌱 Starting database seeding...");
            console.log("=====================================");
            await this.seedUsers();
            await this.seedServiceCategories();
            await this.seedServices();
            await this.seedStylists();
            await this.seedStylistSchedules();
            await this.seedStylistServices();
            console.log("=====================================");
            console.log("✅ All seeders completed successfully!");
            console.log("");
            console.log("📋 Seeded Data Summary:");
            console.log("   👥 Users: 5 (1 super admin, 1 manager, 3 stylists)");
            console.log("   🎯 Service Categories: 6");
            console.log("   ✂️ Services: 12");
            console.log("   💇 Stylists: 3 with schedules");
            console.log("");
            console.log("🔑 Login Credentials:");
            console.log("   Super Admin: superadmin@rusdibarber.com / SuperAdmin123!");
            console.log("   Manager: manager@rusdibarber.com / Manager123!");
            console.log("   Stylist (Ahmad): ahmad@rusdibarber.com / Stylist123!");
            console.log("   Stylist (Budi): budi@rusdibarber.com / Stylist123!");
            console.log("   Stylist (Sari): sari@rusdibarber.com / Stylist123!");
        }
        catch (error) {
            console.error("❌ Error running seeders:", error);
            throw error;
        }
    }
    async clearAll() {
        try {
            console.log("🗑️ Clearing existing data...");
            const { reviews } = await Promise.resolve().then(() => __importStar(require("../models/review")));
            const { payments } = await Promise.resolve().then(() => __importStar(require("../models/payment")));
            const { bookings } = await Promise.resolve().then(() => __importStar(require("../models/booking")));
            const { serviceAddons } = await Promise.resolve().then(() => __importStar(require("../models/service")));
            const { stylistLeaves } = await Promise.resolve().then(() => __importStar(require("../models/stylist")));
            await database_1.db.delete(reviews);
            await database_1.db.delete(payments);
            await database_1.db.delete(bookings);
            await database_1.db.delete(serviceAddons);
            await database_1.db.delete(stylist_1.stylistServices);
            await database_1.db.delete(stylist_1.stylistSchedules);
            await database_1.db.delete(stylistLeaves);
            await database_1.db.delete(stylist_1.stylists);
            await database_1.db.delete(service_1.services);
            await database_1.db.delete(service_1.serviceCategories);
            await database_1.db.delete(user_1.users);
            console.log("✅ All data cleared successfully");
        }
        catch (error) {
            console.error("❌ Error clearing data:", error);
            throw error;
        }
    }
}
exports.default = new DatabaseSeeder();
//# sourceMappingURL=index.js.map