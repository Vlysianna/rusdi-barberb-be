import { db } from "../config/database";
import { users } from "../models/user";
import { stylists, stylistSchedules, stylistServices } from "../models/stylist";
import { services, serviceCategories } from "../models/service";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

class DatabaseSeeder {
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Seed Users (Super Admin, Manager, Stylists)
   */
  async seedUsers() {
    console.log("🌱 Seeding users...");

    const usersData = [
      // Super Admin
      {
        email: "admin@rusdibarber.com",
        password: await this.hashPassword("SuperAdmin123!"),
        fullName: "Super Admin",
        phone: "081234567890",
        role: "admin" as const,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      // Manager
      {
        email: "manager@rusdibarber.com",
        password: await this.hashPassword("Manager123!"),
        fullName: "Branch Manager",
        phone: "081234567891",
        role: "manager" as const,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      // Stylist 1
      {
        email: "ahmad@rusdibarber.com",
        password: await this.hashPassword("Stylist123!"),
        fullName: "Ahmad Rizki",
        phone: "081234567892",
        role: "stylist" as const,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        dateOfBirth: new Date("1990-05-15"),
        gender: "male" as const,
        address: "Jl. Sudirman No. 123, Jakarta",
      },
      // Stylist 2
      {
        email: "budi@rusdibarber.com",
        password: await this.hashPassword("Stylist123!"),
        fullName: "Budi Santoso",
        phone: "081234567893",
        role: "stylist" as const,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        dateOfBirth: new Date("1988-08-20"),
        gender: "male" as const,
        address: "Jl. Thamrin No. 456, Jakarta",
      },
      // Stylist 3
      {
        email: "sari@rusdibarber.com",
        password: await this.hashPassword("Stylist123!"),
        fullName: "Sari Dewi",
        phone: "081234567894",
        role: "stylist" as const,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        dateOfBirth: new Date("1992-03-10"),
        gender: "female" as const,
        address: "Jl. Gatot Subroto No. 789, Jakarta",
      },
    ];

    await db.insert(users).values(usersData);
    console.log("✅ Users seeded successfully");
  }

  /**
   * Seed Service Categories
   */
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

    await db.insert(serviceCategories).values(categoriesData);
    console.log("✅ Service categories seeded successfully");
  }

  /**
   * Seed Services
   */
  async seedServices() {
    console.log("🌱 Seeding services...");

    const servicesData = [
      // Haircut
      {
        name: "Potong Rambut Pria",
        description: "Potong rambut pria dengan gaya klasik atau modern",
        category: "haircut" as const,
        price: "50000.00",
        duration: 30,
        isActive: true,
        isPopular: true,
      },
      {
        name: "Potong Rambut Anak",
        description: "Potong rambut untuk anak-anak (di bawah 12 tahun)",
        category: "haircut" as const,
        price: "35000.00",
        duration: 20,
        isActive: true,
      },
      {
        name: "Potong Rambut Premium",
        description: "Potong rambut dengan konsultasi dan styling lengkap",
        category: "haircut" as const,
        price: "75000.00",
        duration: 45,
        isActive: true,
        isPopular: true,
      },

      // Beard & Mustache
      {
        name: "Cukur Jenggot",
        description: "Cukur dan rapikan jenggot dengan hot towel",
        category: "beard_trim" as const,
        price: "30000.00",
        duration: 20,
        isActive: true,
      },
      {
        name: "Cukur Kumis",
        description: "Rapikan dan bentuk kumis",
        category: "beard_trim" as const,
        price: "20000.00",
        duration: 15,
        isActive: true,
      },

      // Hair Wash
      {
        name: "Cuci Rambut",
        description: "Cuci rambut dengan shampo dan kondisioner premium",
        category: "hair_wash" as const,
        price: "25000.00",
        duration: 15,
        isActive: true,
      },
      {
        name: "Creambath",
        description: "Perawatan rambut dengan creambath dan pijat kepala",
        category: "hair_wash" as const,
        price: "60000.00",
        duration: 45,
        isActive: true,
        isPopular: true,
      },

      // Styling
      {
        name: "Hair Styling",
        description: "Penataan rambut untuk acara khusus",
        category: "styling" as const,
        price: "40000.00",
        duration: 25,
        isActive: true,
      },

      // Coloring
      {
        name: "Pewarnaan Rambut",
        description: "Pewarnaan rambut full dengan cat premium",
        category: "coloring" as const,
        price: "150000.00",
        duration: 90,
        isActive: true,
      },
      {
        name: "Highlight",
        description: "Pewarnaan highlight untuk tampilan dimensional",
        category: "coloring" as const,
        price: "200000.00",
        duration: 120,
        isActive: true,
      },

      // Treatment
      {
        name: "Hair Mask",
        description: "Perawatan masker rambut untuk rambut rusak",
        category: "treatment" as const,
        price: "80000.00",
        duration: 45,
        isActive: true,
      },
      {
        name: "Scalp Treatment",
        description: "Perawatan kulit kepala untuk rambut sehat",
        category: "treatment" as const,
        price: "100000.00",
        duration: 60,
        isActive: true,
      },
    ];

    await db.insert(services).values(servicesData);
    console.log("✅ Services seeded successfully");
  }

  /**
   * Seed Stylists
   */
  async seedStylists() {
    console.log("🌱 Seeding stylists...");

    const stylistUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "stylist"));

    const stylistsData = [
      {
        userId: stylistUsers[0].id, // Ahmad Rizki
        specialties: ["Potong Rambut Pria", "Cukur Jenggot", "Fade Cut"],
        experience: 5,
        rating: "4.80",
        totalReviews: 120,
        isAvailable: true,
        bio: "Barber profesional dengan 5 tahun pengalaman, spesialis potong rambut pria dan fade cut.",
      },
      {
        userId: stylistUsers[1].id, // Budi Santoso
        specialties: ["Hair Styling", "Pewarnaan", "Modern Cut"],
        experience: 3,
        rating: "4.60",
        totalReviews: 85,
        isAvailable: true,
        bio: "Stylist kreatif dengan keahlian pewarnaan dan styling modern.",
      },
      {
        userId: stylistUsers[2].id, // Sari Dewi
        specialties: ["Creambath", "Hair Treatment", "Hair Mask"],
        experience: 4,
        rating: "4.90",
        totalReviews: 150,
        isAvailable: true,
        bio: "Spesialis perawatan rambut dan treatment dengan teknik massage relaksasi.",
      },
    ];

    await db.insert(stylists).values(stylistsData);
    console.log("✅ Stylists seeded successfully");
  }

  /**
   * Seed Stylist Schedules
   */
  async seedStylistSchedules() {
    console.log("🌱 Seeding stylist schedules...");

    const allStylists = await db.select().from(stylists);
    const scheduleData = [];

    for (const stylist of allStylists) {
      // Senin - Sabtu (1-6), jam 09:00 - 21:00
      for (let day = 1; day <= 6; day++) {
        scheduleData.push({
          stylistId: stylist.id,
          dayOfWeek: day,
          startTime: "09:00:00",
          endTime: "21:00:00",
          isAvailable: true,
        });
      }
      // Minggu (0), jam 10:00 - 18:00
      scheduleData.push({
        stylistId: stylist.id,
        dayOfWeek: 0,
        startTime: "10:00:00",
        endTime: "18:00:00",
        isAvailable: true,
      });
    }

    await db.insert(stylistSchedules).values(scheduleData);
    console.log("✅ Stylist schedules seeded successfully");
  }

  /**
   * Seed Stylist Services (mapping stylist ke service)
   */
  async seedStylistServices() {
    console.log("🌱 Seeding stylist services...");

    const allStylists = await db.select().from(stylists);
    const allServices = await db.select().from(services);

    const stylistServicesData = [];

    // Assign services ke setiap stylist
    for (const stylist of allStylists) {
      for (const service of allServices) {
        stylistServicesData.push({
          stylistId: stylist.id,
          serviceId: service.id,
        });
      }
    }

    await db.insert(stylistServices).values(stylistServicesData);
    console.log("✅ Stylist services seeded successfully");
  }

  /**
   * Run all seeders
   */
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
    } catch (error) {
      console.error("❌ Error running seeders:", error);
      throw error;
    }
  }

  /**
   * Clear all data (for fresh seeding)
   */
  async clearAll() {
    try {
      console.log("🗑️ Clearing existing data...");

      // Import semua table yang diperlukan untuk clear
      const { reviews } = await import("../models/review");
      const { payments } = await import("../models/payment");
      const { bookings } = await import("../models/booking");
      const { serviceAddons } = await import("../models/service");
      const { stylistLeaves } = await import("../models/stylist");

      // Clear in reverse dependency order
      await db.delete(reviews);
      await db.delete(payments);
      await db.delete(bookings);
      await db.delete(serviceAddons);
      await db.delete(stylistServices);
      await db.delete(stylistSchedules);
      await db.delete(stylistLeaves);
      await db.delete(stylists);
      await db.delete(services);
      await db.delete(serviceCategories);
      await db.delete(users);

      console.log("✅ All data cleared successfully");
    } catch (error) {
      console.error("❌ Error clearing data:", error);
      throw error;
    }
  }
}

export default new DatabaseSeeder();
