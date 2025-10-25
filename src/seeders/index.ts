import { db } from "../config/database";
import { users } from "../models/user";
import { stylists, stylistSchedules } from "../models/stylist";
import { services, serviceCategories, serviceAddons } from "../models/service";
import { bookings, bookingHistory } from "../models/booking";
import { payments, paymentMethods } from "../models/payment";
import { reviews } from "../models/review";
import { notifications, notificationTemplates } from "../models/review";
import bcrypt from "bcryptjs";

class DatabaseSeeder {
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Seed Users
   */
  async seedUsers() {
    console.log("🌱 Seeding users...");

    const usersData = [
      // Admin Users
      {
        email: "admin@rusdibarber.com",
        password: await this.hashPassword("Admin123!"),
        fullName: "Super Admin",
        phone: "081234567890",
        role: "admin" as const,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      {
        email: "manager@rusdibarber.com",
        password: await this.hashPassword("Manager123!"),
        fullName: "Branch Manager",
        phone: "081234567891",
        role: "admin" as const,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },

      // Stylist Users
      {
        email: "ahmad.stylist@rusdibarber.com",
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
      {
        email: "budi.stylist@rusdibarber.com",
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
      {
        email: "sari.stylist@rusdibarber.com",
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

      // Customer Users
      {
        email: "customer1@example.com",
        password: await this.hashPassword("Customer123!"),
        fullName: "John Doe",
        phone: "081234567895",
        role: "customer" as const,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        dateOfBirth: new Date("1985-12-25"),
        gender: "male" as const,
        address: "Jl. Kemang No. 101, Jakarta",
      },
      {
        email: "customer2@example.com",
        password: await this.hashPassword("Customer123!"),
        fullName: "Jane Smith",
        phone: "081234567896",
        role: "customer" as const,
        isActive: true,
        emailVerified: false,
        dateOfBirth: new Date("1990-07-18"),
        gender: "female" as const,
        address: "Jl. Senopati No. 202, Jakarta",
      },
      {
        email: "customer3@example.com",
        password: await this.hashPassword("Customer123!"),
        fullName: "Michael Johnson",
        phone: "081234567897",
        role: "customer" as const,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        dateOfBirth: new Date("1987-11-30"),
        gender: "male" as const,
        address: "Jl. Blok M No. 303, Jakarta",
      },
      {
        email: "customer4@example.com",
        password: await this.hashPassword("Customer123!"),
        fullName: "Sarah Wilson",
        phone: "081234567898",
        role: "customer" as const,
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        dateOfBirth: new Date("1993-04-22"),
        gender: "female" as const,
        address: "Jl. Pondok Indah No. 404, Jakarta",
      },
      {
        email: "customer5@example.com",
        password: await this.hashPassword("Customer123!"),
        fullName: "David Brown",
        phone: "081234567899",
        role: "customer" as const,
        isActive: true,
        emailVerified: false,
        dateOfBirth: new Date("1986-09-14"),
        gender: "male" as const,
        address: "Jl. Kelapa Gading No. 505, Jakarta",
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
        description: "Professional haircut services for men and women",
        icon: "scissors",
        sortOrder: 1,
        isActive: true,
      },
      {
        name: "Beard & Mustache",
        description: "Beard trimming, shaping and mustache grooming",
        icon: "beard",
        sortOrder: 2,
        isActive: true,
      },
      {
        name: "Hair Wash & Care",
        description: "Hair washing, conditioning and scalp treatments",
        icon: "water-drop",
        sortOrder: 3,
        isActive: true,
      },
      {
        name: "Hair Styling",
        description: "Hair styling, setting and special occasion looks",
        icon: "hair-dryer",
        sortOrder: 4,
        isActive: true,
      },
      {
        name: "Hair Coloring",
        description: "Hair dyeing, highlights and color treatments",
        icon: "palette",
        sortOrder: 5,
        isActive: true,
      },
      {
        name: "Hair Treatment",
        description: "Hair masks, keratin and specialized treatments",
        icon: "treatment",
        sortOrder: 6,
        isActive: true,
      },
      {
        name: "Package Deals",
        description: "Combo packages with multiple services",
        icon: "package",
        sortOrder: 7,
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
      // Haircut Services
      {
        name: "Classic Men's Haircut",
        description:
          "Traditional men's haircut with scissors and clipper. Includes consultation, wash, cut, and basic styling.",
        category: "haircut" as const,
        price: "75000.00",
        duration: 45,
        isActive: true,
        image: "/images/services/mens-classic-haircut.jpg",
      },
      {
        name: "Modern Men's Haircut",
        description:
          "Contemporary men's haircut with modern techniques. Includes fade, undercut options, wash and styling.",
        category: "haircut" as const,
        price: "95000.00",
        duration: 60,
        isActive: true,
        image: "/images/services/mens-modern-haircut.jpg",
      },
      {
        name: "Women's Haircut & Blow Dry",
        description:
          "Professional women's haircut with blow dry and styling. Includes consultation and hair treatment.",
        category: "haircut" as const,
        price: "125000.00",
        duration: 90,
        isActive: true,
        image: "/images/services/womens-haircut.jpg",
      },
      {
        name: "Kids Haircut (Under 12)",
        description:
          "Fun and gentle haircut for children. Patient stylists and kid-friendly environment.",
        category: "haircut" as const,
        price: "50000.00",
        duration: 30,
        isActive: true,
        image: "/images/services/kids-haircut.jpg",
      },

      // Beard & Mustache Services
      {
        name: "Beard Trim & Shape",
        description:
          "Professional beard trimming and shaping service. Includes hot towel treatment and aftercare.",
        category: "beard_trim" as const,
        price: "45000.00",
        duration: 30,
        isActive: true,
        image: "/images/services/beard-trim.jpg",
      },
      {
        name: "Mustache Grooming",
        description:
          "Precision mustache trimming and styling with professional tools.",
        category: "beard_trim" as const,
        price: "25000.00",
        duration: 15,
        isActive: true,
        image: "/images/services/mustache-grooming.jpg",
      },
      {
        name: "Full Beard Treatment",
        description:
          "Complete beard service including wash, trim, shape, oil treatment and styling.",
        category: "beard_trim" as const,
        price: "85000.00",
        duration: 45,
        isActive: true,
        image: "/images/services/full-beard-treatment.jpg",
      },

      // Hair Wash & Care Services
      {
        name: "Premium Hair Wash",
        description:
          "Luxurious hair washing with premium shampoo, conditioner and scalp massage.",
        category: "hair_wash" as const,
        price: "35000.00",
        duration: 20,
        isActive: true,
        image: "/images/services/hair-wash.jpg",
      },
      {
        name: "Scalp Treatment",
        description:
          "Deep cleansing scalp treatment with specialized products and massage.",
        category: "hair_wash" as const,
        price: "65000.00",
        duration: 30,
        isActive: true,
        image: "/images/services/scalp-treatment.jpg",
      },

      // Hair Styling Services
      {
        name: "Special Event Styling",
        description:
          "Professional hair styling for weddings, parties and special occasions.",
        category: "styling" as const,
        price: "150000.00",
        duration: 75,
        isActive: true,
        image: "/images/services/event-styling.jpg",
      },
      {
        name: "Daily Hair Styling",
        description:
          "Quick and professional daily hair styling with long-lasting hold.",
        category: "styling" as const,
        price: "45000.00",
        duration: 25,
        isActive: true,
        image: "/images/services/daily-styling.jpg",
      },

      // Hair Coloring Services
      {
        name: "Full Hair Coloring",
        description:
          "Complete hair color change with premium color products. Includes consultation and aftercare.",
        category: "coloring" as const,
        price: "285000.00",
        duration: 180,
        isActive: true,
        image: "/images/services/full-coloring.jpg",
      },
      {
        name: "Highlights",
        description:
          "Professional hair highlights using foil technique. Natural looking dimensional color.",
        category: "coloring" as const,
        price: "225000.00",
        duration: 150,
        isActive: true,
        image: "/images/services/highlights.jpg",
      },
      {
        name: "Root Touch-up",
        description:
          "Quick root color touch-up service to maintain your current hair color.",
        category: "coloring" as const,
        price: "125000.00",
        duration: 75,
        isActive: true,
        image: "/images/services/root-touchup.jpg",
      },

      // Hair Treatment Services
      {
        name: "Keratin Hair Treatment",
        description:
          "Professional keratin treatment to smooth, strengthen and add shine to hair.",
        category: "treatment" as const,
        price: "450000.00",
        duration: 240,
        isActive: true,
        image: "/images/services/keratin-treatment.jpg",
      },
      {
        name: "Deep Conditioning Mask",
        description:
          "Intensive hair mask treatment for damaged, dry or chemically treated hair.",
        category: "treatment" as const,
        price: "80000.00",
        duration: 45,
        isActive: true,
        image: "/images/services/hair-mask.jpg",
      },

      // Package Deals
      {
        name: "Gentleman's Complete Package",
        description:
          "Complete grooming package: haircut, beard trim, hair wash, and styling.",
        category: "package" as const,
        price: "185000.00",
        duration: 105,
        isActive: true,
        image: "/images/services/gentleman-package.jpg",
      },
      {
        name: "Bridal Hair Package",
        description:
          "Complete bridal hair service: consultation, trial, wash, cut, color touch-up, and styling.",
        category: "package" as const,
        price: "650000.00",
        duration: 300,
        isActive: true,
        image: "/images/services/bridal-package.jpg",
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

    // Get stylist users
    const stylistUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "stylist"));

    const stylistsData = [
      {
        userId: stylistUsers[0].id, // Ahmad Rizki
        specialties: [
          "Men's Haircut",
          "Beard Styling",
          "Classic Cuts",
          "Fade Cuts",
        ],
        experience: 8,
        rating: "4.80",
        totalReviews: 156,
        isAvailable: true,
        bio: "Ahmad is a master barber with 8+ years of experience specializing in classic and modern men's cuts. Known for attention to detail and creating the perfect fade.",
        portfolio: [
          "/images/portfolio/ahmad-1.jpg",
          "/images/portfolio/ahmad-2.jpg",
          "/images/portfolio/ahmad-3.jpg",
        ],
      },
      {
        userId: stylistUsers[1].id, // Budi Santoso
        specialties: [
          "Hair Coloring",
          "Modern Cuts",
          "Beard Treatment",
          "Hair Styling",
        ],
        experience: 6,
        rating: "4.60",
        totalReviews: 98,
        isAvailable: true,
        bio: "Budi specializes in hair coloring and modern styling techniques. Creative approach to color and passionate about helping clients achieve their perfect look.",
        portfolio: [
          "/images/portfolio/budi-1.jpg",
          "/images/portfolio/budi-2.jpg",
        ],
      },
      {
        userId: stylistUsers[2].id, // Sari Dewi
        specialties: [
          "Women's Cuts",
          "Hair Treatment",
          "Bridal Styling",
          "Keratin Treatment",
        ],
        experience: 7,
        rating: "4.90",
        totalReviews: 203,
        isAvailable: true,
        bio: "Sari is our lead female stylist with expertise in women's cuts, treatments, and special occasion styling. Certified in advanced keratin treatments.",
        portfolio: [
          "/images/portfolio/sari-1.jpg",
          "/images/portfolio/sari-2.jpg",
          "/images/portfolio/sari-3.jpg",
          "/images/portfolio/sari-4.jpg",
        ],
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

    // Create schedules for all stylists (Monday-Saturday, 9 AM - 6 PM)
    for (const stylist of allStylists) {
      for (let day = 1; day <= 6; day++) {
        // Monday to Saturday
        scheduleData.push({
          stylistId: stylist.id,
          dayOfWeek: day,
          startTime: "09:00:00",
          endTime: "18:00:00",
          isAvailable: true,
        });
      }
    }

    await db.insert(stylistSchedules).values(scheduleData);
    console.log("✅ Stylist schedules seeded successfully");
  }

  /**
   * Seed Service Addons
   */
  async seedServiceAddons() {
    console.log("🌱 Seeding service addons...");

    const allServices = await db.select().from(services);

    // Find haircut services for addons
    const haircutServices = allServices.filter((s) => s.category === "haircut");

    const addonsData = [
      // Addons for haircut services
      {
        serviceId: haircutServices[0].id,
        name: "Hot Towel Treatment",
        description:
          "Relaxing hot towel treatment to open pores and soften hair",
        price: "15000.00",
        isActive: true,
      },
      {
        serviceId: haircutServices[0].id,
        name: "Head Massage",
        description: "5-minute relaxing head and scalp massage",
        price: "20000.00",
        isActive: true,
      },
      {
        serviceId: haircutServices[1].id,
        name: "Beard Line-up",
        description: "Clean beard line-up and shaping",
        price: "35000.00",
        isActive: true,
      },
      {
        serviceId: haircutServices[2].id,
        name: "Hair Treatment Mask",
        description: "Nourishing hair mask application",
        price: "25000.00",
        isActive: true,
      },
    ];

    await db.insert(serviceAddons).values(addonsData);
    console.log("✅ Service addons seeded successfully");
  }

  /**
   * Seed Notification Templates
   */
  async seedNotificationTemplates() {
    console.log("🌱 Seeding notification templates...");

    const templatesData = [
      {
        name: "booking_confirmation",
        type: "booking_confirmation" as const,
        channel: "email" as const,
        subject: "Booking Confirmation - Rusdi Barber",
        title: "Your booking has been confirmed!",
        template: `
          <h2>Booking Confirmed!</h2>
          <p>Hi {{customerName}},</p>
          <p>Your booking has been confirmed with the following details:</p>
          <ul>
            <li><strong>Service:</strong> {{serviceName}}</li>
            <li><strong>Stylist:</strong> {{stylistName}}</li>
            <li><strong>Date:</strong> {{appointmentDate}}</li>
            <li><strong>Time:</strong> {{appointmentTime}}</li>
            <li><strong>Total Amount:</strong> Rp {{totalAmount}}</li>
          </ul>
          <p>We look forward to seeing you!</p>
          <p>Best regards,<br>Rusdi Barber Team</p>
        `,
        variables: [
          "customerName",
          "serviceName",
          "stylistName",
          "appointmentDate",
          "appointmentTime",
          "totalAmount",
        ],
        isActive: true,
      },
      {
        name: "booking_reminder",
        type: "booking_reminder" as const,
        channel: "email" as const,
        subject: "Appointment Reminder - Tomorrow at Rusdi Barber",
        title: "Don't forget your appointment tomorrow!",
        template: `
          <h2>Appointment Reminder</h2>
          <p>Hi {{customerName}},</p>
          <p>This is a friendly reminder about
 your appointment tomorrow:</p>
          <ul>
            <li><strong>Service:</strong> {{serviceName}}</li>
            <li><strong>Stylist:</strong> {{stylistName}}</li>
            <li><strong>Date:</strong> {{appointmentDate}}</li>
            <li><strong>Time:</strong> {{appointmentTime}}</li>
          </ul>
          <p>Please arrive 10 minutes before your appointment time.</p>
          <p>See you soon!</p>
        `,
        variables: [
          "customerName",
          "serviceName",
          "stylistName",
          "appointmentDate",
          "appointmentTime",
        ],
        isActive: true,
      },
      {
        name: "payment_success",
        type: "payment_success" as const,
        channel: "email" as const,
        subject: "Payment Received - Rusdi Barber",
        title: "Payment successful!",
        template: `
          <h2>Payment Confirmed</h2>
          <p>Hi {{customerName}},</p>
          <p>We have received your payment for booking #{{bookingId}}.</p>
          <ul>
            <li><strong>Amount:</strong> Rp {{amount}}</li>
            <li><strong>Payment Method:</strong> {{paymentMethod}}</li>
            <li><strong>Transaction ID:</strong> {{transactionId}}</li>
          </ul>
          <p>Thank you for choosing Rusdi Barber!</p>
        `,
        variables: [
          "customerName",
          "bookingId",
          "amount",
          "paymentMethod",
          "transactionId",
        ],
        isActive: true,
      },
      {
        name: "review_request",
        type: "review_request" as const,
        channel: "email" as const,
        subject: "How was your experience at Rusdi Barber?",
        title: "We'd love your feedback!",
        template: `
          <h2>Rate Your Experience</h2>
          <p>Hi {{customerName}},</p>
          <p>Thank you for visiting Rusdi Barber! We hope you loved your new look.</p>
          <p>Woul
d you mind taking a moment to rate your experience with {{stylistName}}?</p>
          <p><a href="{{reviewUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Leave a Review</a></p>
          <p>Your feedback helps us improve our services.</p>
          <p>Thank you!</p>
        `,
        variables: ["customerName", "stylistName", "reviewUrl"],
        isActive: true,
      },
    ];

    await db.insert(notificationTemplates).values(templatesData);
    console.log("✅ Notification templates seeded successfully");
  }

  /**
   * Seed Sample Bookings
   */
  async seedSampleBookings() {
    console.log("🌱 Seeding sample bookings...");

    const customers = await db
      .select()
      .from(users)
      .where(eq(users.role, "customer"))
      .limit(3);

    const allStylists = await db.select().from(stylists);
    const allServices = await db.select().from(services).limit(5);

    const now = new Date();
    const bookingsData = [
      {
        customerId: customers[0].id,
        stylistId: allStylists[0].id,
        serviceId: allServices[0].id,
        appointmentDate: new Date(now.getTime() + 86400000), // Tomorrow
        appointmentTime: "10:00:00",
        endTime: "10:45:00",
        status: "confirmed" as const,
        totalAmount: allServices[0].price,
        notes: "First time customer, please be gentle with explanations",
        confirmedAt: new Date(),
      },
      {
        customerId: customers[1].id,
        stylistId: allStylists[1].id,
        serviceId: allServices[1].id,
        appointmentDate: new Date(now.getTime() + 2 * 86400000), // Day after tomorrow
        appointmentTime: "14:30:00",
        endTime: "15:30:00",
        status: "pending" as const,
        totalAmount: allServices[1].price,
        notes: "Prefer modern style, show portfolio before starting",
      },
      {
        customerId: customers[2].id,
        stylistId: allStylists[2].id,
        serviceId: allServices[2].id,
        appointmentDate: new Date(now.getTime() - 86400000), // Yesterday
        appointmentTime: "11:00:00",
        endTime: "12:30:00",
        status: "completed" as const,
        totalAmount: allServices[2].price,
        completedAt: new Date(now.getTime() - 82800000),
      },
      {
        customerId: customers[0].id,
        stylistId: allStylists[1].id,
        serviceId: allServices[3].id,
        appointmentDate: new Date(now.getTime() - 2 * 86400000), // 2 days ago
        appointmentTime: "15:00:00",
        endTime: "16:30:00",
        status: "completed" as const,
        totalAmount: allServices[3].price,
        completedAt: new Date(now.getTime() - 2 * 82800000),
      },
      {
        customerId: customers[1].id,
        stylistId: allStylists[2].id,
        serviceId: allServices[4].id,
        appointmentDate: new Date(now.getTime() - 7 * 86400000), // 1 week ago
        appointmentTime: "13:00:00",
        endTime: "15:00:00",
        status: "completed" as const,
        totalAmount: allServices[4].price,
        completedAt: new Date(now.getTime() - 7 * 82800000),
      },
    ];

    await db.insert(bookings).values(bookingsData);
    console.log("✅ Sample bookings seeded successfully");
  }

  /**
   * Seed Sample Payments
   */
  async seedSamplePayments() {
    console.log("🌱 Seeding sample payments...");

    const completedBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.status, "completed"));

    if (completedBookings.length === 0) {
      console.log("⚠️ No completed bookings found, skipping payments");
      return;
    }

    const paymentsData = [
      {
        bookingId: completedBookings[0].id,
        customerId: completedBookings[0].customerId,
        amount: completedBookings[0].totalAmount,
        method: "credit_card" as const,
        status: "paid" as const,
        transactionId: `TXN_${Date.now()}_ABC123`,
        currency: "IDR",
        fees: (parseFloat(completedBookings[0].totalAmount) * 0.029).toFixed(2),
        netAmount: (
          parseFloat(completedBookings[0].totalAmount) * 0.971
        ).toFixed(2),
        gatewayProvider: "dummy-gateway",
        paymentGatewayResponse: {
          gatewayTransactionId: `GW_${Date.now()}`,
          authCode: "AUTH123",
          gatewayStatus: "COMPLETED",
        },
        paidAt: completedBookings[0].completedAt,
      },
      {
        bookingId: completedBookings[1]?.id || completedBookings[0].id,
        customerId:
          completedBookings[1]?.customerId || completedBookings[0].customerId,
        amount:
          completedBookings[1]?.totalAmount || completedBookings[0].totalAmount,
        method: "digital_wallet" as const,
        status: "paid" as const,
        transactionId: `TXN_${Date.now()}_DEF456`,
        currency: "IDR",
        fees: (
          parseFloat(
            completedBookings[1]?.totalAmount ||
              completedBookings[0].totalAmount,
          ) * 0.02
        ).toFixed(2),
        netAmount: (
          parseFloat(
            completedBookings[1]?.totalAmount ||
              completedBookings[0].totalAmount,
          ) * 0.98
        ).toFixed(2),
        gatewayProvider: "dummy-gateway",
        paymentGatewayResponse: {
          gatewayTransactionId: `GW_${Date.now() + 1000}`,
          authCode: "AUTH456",
          gatewayStatus: "COMPLETED",
        },
        paidAt:
          completedBookings[1]?.completedAt || completedBookings[0].completedAt,
      },
      {
        bookingId: completedBookings[2]?.id || completedBookings[0].id,
        customerId:
          completedBookings[2]?.customerId || completedBookings[0].customerId,
        amount:
          completedBookings[2]?.totalAmount || completedBookings[0].totalAmount,
        method: "cash" as const,
        status: "paid" as const,
        transactionId: `TXN_${Date.now()}_CASH001`,
        currency: "IDR",
        fees: "0.00",
        netAmount:
          completedBookings[2]?.totalAmount || completedBookings[0].totalAmount,
        gatewayProvider: "manual",
        paymentGatewayResponse: {
          method: "cash",
          status: "COMPLETED",
        },
        paidAt:
          completedBookings[2]?.completedAt || completedBookings[0].completedAt,
      },
    ];

    await db.insert(payments).values(paymentsData);
    console.log("✅ Sample payments seeded successfully");
  }

  /**
   * Seed Sample Reviews
   */
  async seedSampleReviews() {
    console.log("🌱 Seeding sample reviews...");

    const completedBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.status, "completed"));

    if (completedBookings.length === 0) {
      console.log("⚠️ No completed bookings found, skipping reviews");
      return;
    }

    const reviewsData = [
      {
        bookingId: completedBookings[0].id,
        customerId: completedBookings[0].customerId,
        stylistId: completedBookings[0].stylistId,
        rating: 5,
        comment:
          "Excellent service! The stylist was very professional and I love my new haircut. Will definitely come back again. Highly recommended!",
        isVisible: true,
        likes: 3,
      },
    ];

    await db.insert(reviews).values(reviewsData);
    console.log("✅ Sample reviews seeded successfully");
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
      await this.seedServiceAddons();
      await this.seedNotificationTemplates();
      await this.seedSampleBookings();
      await this.seedSamplePayments();
      await this.seedSampleReviews();

      console.log("=====================================");
      console.log("✅ All seeders completed successfully!");
      console.log("");
      console.log("📋 Seeded Data Summary:");
      console.log("   👥 Users: 10 (2 admin, 3 stylist, 5 customer)");
      console.log("   🎯 Service Categories: 7");
      console.log("   ✂️ Services: 18");
      console.log("   💇 Stylists: 3 with schedules");
      console.log("   🎁 Service Addons: 4");
      console.log("   📧 Notification Templates: 4");
      console.log("   📅 Sample Bookings: 5");
      console.log("   💳 Sample Payments: 3");
      console.log("   ⭐ Sample Reviews: 1");
      console.log("");
      console.log("🔑 Login Credentials:");
      console.log("   Admin: admin@rusdibarber.com / Admin123!");
      console.log("   Manager: manager@rusdibarber.com / Manager123!");
      console.log("   Stylist: ahmad.stylist@rusdibarber.com / Stylist123!");
      console.log("   Customer: customer1@example.com / Customer123!");
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

      // Clear in reverse dependency order
      await db.delete(reviews);
      await db.delete(payments);
      await db.delete(bookings);
      await db.delete(serviceAddons);
      await db.delete(services);
      await db.delete(serviceCategories);
      await db.delete(stylistSchedules);
      await db.delete(stylists);
      await db.delete(notificationTemplates);
      await db.delete(users);

      console.log("✅ All data cleared successfully");
    } catch (error) {
      console.error("❌ Error clearing data:", error);
      throw error;
    }
  }
}

export default new DatabaseSeeder();

// Import missing functions
import { eq } from "drizzle-orm";
