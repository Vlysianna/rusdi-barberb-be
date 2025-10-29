"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const user_1 = require("../models/user");
const stylist_1 = require("../models/stylist");
const service_1 = require("../models/service");
const booking_1 = require("../models/booking");
const payment_1 = require("../models/payment");
const review_1 = require("../models/review");
const review_2 = require("../models/review");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class DatabaseSeeder {
    async hashPassword(password) {
        return await bcryptjs_1.default.hash(password, 12);
    }
    async seedUsers() {
        console.log("🌱 Seeding users...");
        const usersData = [
            {
                email: "admin@rusdibarber.com",
                password: await this.hashPassword("Admin123!"),
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
                email: "ahmad.stylist@rusdibarber.com",
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
                email: "budi.stylist@rusdibarber.com",
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
                email: "sari.stylist@rusdibarber.com",
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
            {
                email: "customer1@example.com",
                password: await this.hashPassword("Customer123!"),
                fullName: "John Doe",
                phone: "081234567895",
                role: "customer",
                isActive: true,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                dateOfBirth: new Date("1985-12-25"),
                gender: "male",
                address: "Jl. Kemang No. 101, Jakarta",
            },
            {
                email: "customer2@example.com",
                password: await this.hashPassword("Customer123!"),
                fullName: "Jane Smith",
                phone: "081234567896",
                role: "customer",
                isActive: true,
                emailVerified: false,
                dateOfBirth: new Date("1990-07-18"),
                gender: "female",
                address: "Jl. Senopati No. 202, Jakarta",
            },
            {
                email: "customer3@example.com",
                password: await this.hashPassword("Customer123!"),
                fullName: "Michael Johnson",
                phone: "081234567897",
                role: "customer",
                isActive: true,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                dateOfBirth: new Date("1987-11-30"),
                gender: "male",
                address: "Jl. Blok M No. 303, Jakarta",
            },
            {
                email: "customer4@example.com",
                password: await this.hashPassword("Customer123!"),
                fullName: "Sarah Wilson",
                phone: "081234567898",
                role: "customer",
                isActive: true,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                dateOfBirth: new Date("1993-04-22"),
                gender: "female",
                address: "Jl. Pondok Indah No. 404, Jakarta",
            },
            {
                email: "customer5@example.com",
                password: await this.hashPassword("Customer123!"),
                fullName: "David Brown",
                phone: "081234567899",
                role: "customer",
                isActive: true,
                emailVerified: false,
                dateOfBirth: new Date("1986-09-14"),
                gender: "male",
                address: "Jl. Kelapa Gading No. 505, Jakarta",
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
        await database_1.db.insert(service_1.serviceCategories).values(categoriesData);
        console.log("✅ Service categories seeded successfully");
    }
    async seedServices() {
        console.log("🌱 Seeding services...");
        const servicesData = [
            {
                name: "Classic Men's Haircut",
                description: "Traditional men's haircut with scissors and clipper. Includes consultation, wash, cut, and basic styling.",
                category: "haircut",
                price: "75000.00",
                duration: 45,
                isActive: true,
                image: "/images/services/mens-classic-haircut.jpg",
            },
            {
                name: "Modern Men's Haircut",
                description: "Contemporary men's haircut with modern techniques. Includes fade, undercut options, wash and styling.",
                category: "haircut",
                price: "95000.00",
                duration: 60,
                isActive: true,
                image: "/images/services/mens-modern-haircut.jpg",
            },
            {
                name: "Women's Haircut & Blow Dry",
                description: "Professional women's haircut with blow dry and styling. Includes consultation and hair treatment.",
                category: "haircut",
                price: "125000.00",
                duration: 90,
                isActive: true,
                image: "/images/services/womens-haircut.jpg",
            },
            {
                name: "Kids Haircut (Under 12)",
                description: "Fun and gentle haircut for children. Patient stylists and kid-friendly environment.",
                category: "haircut",
                price: "50000.00",
                duration: 30,
                isActive: true,
                image: "/images/services/kids-haircut.jpg",
            },
            {
                name: "Beard Trim & Shape",
                description: "Professional beard trimming and shaping service. Includes hot towel treatment and aftercare.",
                category: "beard_trim",
                price: "45000.00",
                duration: 30,
                isActive: true,
                image: "/images/services/beard-trim.jpg",
            },
            {
                name: "Mustache Grooming",
                description: "Precision mustache trimming and styling with professional tools.",
                category: "beard_trim",
                price: "25000.00",
                duration: 15,
                isActive: true,
                image: "/images/services/mustache-grooming.jpg",
            },
            {
                name: "Full Beard Treatment",
                description: "Complete beard service including wash, trim, shape, oil treatment and styling.",
                category: "beard_trim",
                price: "85000.00",
                duration: 45,
                isActive: true,
                image: "/images/services/full-beard-treatment.jpg",
            },
            {
                name: "Premium Hair Wash",
                description: "Luxurious hair washing with premium shampoo, conditioner and scalp massage.",
                category: "hair_wash",
                price: "35000.00",
                duration: 20,
                isActive: true,
                image: "/images/services/hair-wash.jpg",
            },
            {
                name: "Scalp Treatment",
                description: "Deep cleansing scalp treatment with specialized products and massage.",
                category: "hair_wash",
                price: "65000.00",
                duration: 30,
                isActive: true,
                image: "/images/services/scalp-treatment.jpg",
            },
            {
                name: "Special Event Styling",
                description: "Professional hair styling for weddings, parties and special occasions.",
                category: "styling",
                price: "150000.00",
                duration: 75,
                isActive: true,
                image: "/images/services/event-styling.jpg",
            },
            {
                name: "Daily Hair Styling",
                description: "Quick and professional daily hair styling with long-lasting hold.",
                category: "styling",
                price: "45000.00",
                duration: 25,
                isActive: true,
                image: "/images/services/daily-styling.jpg",
            },
            {
                name: "Full Hair Coloring",
                description: "Complete hair color change with premium color products. Includes consultation and aftercare.",
                category: "coloring",
                price: "285000.00",
                duration: 180,
                isActive: true,
                image: "/images/services/full-coloring.jpg",
            },
            {
                name: "Highlights",
                description: "Professional hair highlights using foil technique. Natural looking dimensional color.",
                category: "coloring",
                price: "225000.00",
                duration: 150,
                isActive: true,
                image: "/images/services/highlights.jpg",
            },
            {
                name: "Root Touch-up",
                description: "Quick root color touch-up service to maintain your current hair color.",
                category: "coloring",
                price: "125000.00",
                duration: 75,
                isActive: true,
                image: "/images/services/root-touchup.jpg",
            },
            {
                name: "Keratin Hair Treatment",
                description: "Professional keratin treatment to smooth, strengthen and add shine to hair.",
                category: "treatment",
                price: "450000.00",
                duration: 240,
                isActive: true,
                image: "/images/services/keratin-treatment.jpg",
            },
            {
                name: "Deep Conditioning Mask",
                description: "Intensive hair mask treatment for damaged, dry or chemically treated hair.",
                category: "treatment",
                price: "80000.00",
                duration: 45,
                isActive: true,
                image: "/images/services/hair-mask.jpg",
            },
            {
                name: "Gentleman's Complete Package",
                description: "Complete grooming package: haircut, beard trim, hair wash, and styling.",
                category: "package",
                price: "185000.00",
                duration: 105,
                isActive: true,
                image: "/images/services/gentleman-package.jpg",
            },
            {
                name: "Bridal Hair Package",
                description: "Complete bridal hair service: consultation, trial, wash, cut, color touch-up, and styling.",
                category: "package",
                price: "650000.00",
                duration: 300,
                isActive: true,
                image: "/images/services/bridal-package.jpg",
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
                userId: stylistUsers[1].id,
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
                userId: stylistUsers[2].id,
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
                    endTime: "18:00:00",
                    isAvailable: true,
                });
            }
        }
        await database_1.db.insert(stylist_1.stylistSchedules).values(scheduleData);
        console.log("✅ Stylist schedules seeded successfully");
    }
    async seedServiceAddons() {
        console.log("🌱 Seeding service addons...");
        const allServices = await database_1.db.select().from(service_1.services);
        const haircutServices = allServices.filter((s) => s.category === "haircut");
        const addonsData = [
            {
                serviceId: haircutServices[0].id,
                name: "Hot Towel Treatment",
                description: "Relaxing hot towel treatment to open pores and soften hair",
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
        await database_1.db.insert(service_1.serviceAddons).values(addonsData);
        console.log("✅ Service addons seeded successfully");
    }
    async seedNotificationTemplates() {
        console.log("🌱 Seeding notification templates...");
        const templatesData = [
            {
                name: "booking_confirmation",
                type: "booking_confirmation",
                channel: "email",
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
                type: "booking_reminder",
                channel: "email",
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
                type: "payment_success",
                channel: "email",
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
                type: "review_request",
                channel: "email",
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
        await database_1.db.insert(review_2.notificationTemplates).values(templatesData);
        console.log("✅ Notification templates seeded successfully");
    }
    async seedSampleBookings() {
        console.log("🌱 Seeding sample bookings...");
        const customers = await database_1.db
            .select()
            .from(user_1.users)
            .where((0, drizzle_orm_1.eq)(user_1.users.role, "customer"))
            .limit(3);
        const allStylists = await database_1.db.select().from(stylist_1.stylists);
        const allServices = await database_1.db.select().from(service_1.services).limit(5);
        const now = new Date();
        const bookingsData = [
            {
                customerId: customers[0].id,
                stylistId: allStylists[0].id,
                serviceId: allServices[0].id,
                appointmentDate: new Date(now.getTime() + 86400000),
                appointmentTime: "10:00:00",
                endTime: "10:45:00",
                status: "confirmed",
                totalAmount: allServices[0].price,
                notes: "First time customer, please be gentle with explanations",
                confirmedAt: new Date(),
            },
            {
                customerId: customers[1].id,
                stylistId: allStylists[1].id,
                serviceId: allServices[1].id,
                appointmentDate: new Date(now.getTime() + 2 * 86400000),
                appointmentTime: "14:30:00",
                endTime: "15:30:00",
                status: "pending",
                totalAmount: allServices[1].price,
                notes: "Prefer modern style, show portfolio before starting",
            },
            {
                customerId: customers[2].id,
                stylistId: allStylists[2].id,
                serviceId: allServices[2].id,
                appointmentDate: new Date(now.getTime() - 86400000),
                appointmentTime: "11:00:00",
                endTime: "12:30:00",
                status: "completed",
                totalAmount: allServices[2].price,
                completedAt: new Date(now.getTime() - 82800000),
            },
            {
                customerId: customers[0].id,
                stylistId: allStylists[1].id,
                serviceId: allServices[3].id,
                appointmentDate: new Date(now.getTime() - 2 * 86400000),
                appointmentTime: "15:00:00",
                endTime: "16:30:00",
                status: "completed",
                totalAmount: allServices[3].price,
                completedAt: new Date(now.getTime() - 2 * 82800000),
            },
            {
                customerId: customers[1].id,
                stylistId: allStylists[2].id,
                serviceId: allServices[4].id,
                appointmentDate: new Date(now.getTime() - 7 * 86400000),
                appointmentTime: "13:00:00",
                endTime: "15:00:00",
                status: "completed",
                totalAmount: allServices[4].price,
                completedAt: new Date(now.getTime() - 7 * 82800000),
            },
        ];
        await database_1.db.insert(booking_1.bookings).values(bookingsData);
        console.log("✅ Sample bookings seeded successfully");
    }
    async seedSamplePayments() {
        console.log("🌱 Seeding sample payments...");
        const completedBookings = await database_1.db
            .select()
            .from(booking_1.bookings)
            .where((0, drizzle_orm_1.eq)(booking_1.bookings.status, "completed"));
        if (completedBookings.length === 0) {
            console.log("⚠️ No completed bookings found, skipping payments");
            return;
        }
        const paymentsData = [
            {
                bookingId: completedBookings[0].id,
                customerId: completedBookings[0].customerId,
                amount: completedBookings[0].totalAmount,
                method: "credit_card",
                status: "paid",
                transactionId: `TXN_${Date.now()}_ABC123`,
                currency: "IDR",
                fees: (parseFloat(completedBookings[0].totalAmount) * 0.029).toFixed(2),
                netAmount: (parseFloat(completedBookings[0].totalAmount) * 0.971).toFixed(2),
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
                customerId: completedBookings[1]?.customerId || completedBookings[0].customerId,
                amount: completedBookings[1]?.totalAmount || completedBookings[0].totalAmount,
                method: "digital_wallet",
                status: "paid",
                transactionId: `TXN_${Date.now()}_DEF456`,
                currency: "IDR",
                fees: (parseFloat(completedBookings[1]?.totalAmount ||
                    completedBookings[0].totalAmount) * 0.02).toFixed(2),
                netAmount: (parseFloat(completedBookings[1]?.totalAmount ||
                    completedBookings[0].totalAmount) * 0.98).toFixed(2),
                gatewayProvider: "dummy-gateway",
                paymentGatewayResponse: {
                    gatewayTransactionId: `GW_${Date.now() + 1000}`,
                    authCode: "AUTH456",
                    gatewayStatus: "COMPLETED",
                },
                paidAt: completedBookings[1]?.completedAt || completedBookings[0].completedAt,
            },
            {
                bookingId: completedBookings[2]?.id || completedBookings[0].id,
                customerId: completedBookings[2]?.customerId || completedBookings[0].customerId,
                amount: completedBookings[2]?.totalAmount || completedBookings[0].totalAmount,
                method: "cash",
                status: "paid",
                transactionId: `TXN_${Date.now()}_CASH001`,
                currency: "IDR",
                fees: "0.00",
                netAmount: completedBookings[2]?.totalAmount || completedBookings[0].totalAmount,
                gatewayProvider: "manual",
                paymentGatewayResponse: {
                    method: "cash",
                    status: "COMPLETED",
                },
                paidAt: completedBookings[2]?.completedAt || completedBookings[0].completedAt,
            },
        ];
        await database_1.db.insert(payment_1.payments).values(paymentsData);
        console.log("✅ Sample payments seeded successfully");
    }
    async seedSampleReviews() {
        console.log("🌱 Seeding sample reviews...");
        const completedBookings = await database_1.db
            .select()
            .from(booking_1.bookings)
            .where((0, drizzle_orm_1.eq)(booking_1.bookings.status, "completed"));
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
                comment: "Excellent service! The stylist was very professional and I love my new haircut. Will definitely come back again. Highly recommended!",
                isVisible: true,
                likes: 3,
            },
        ];
        await database_1.db.insert(review_1.reviews).values(reviewsData);
        console.log("✅ Sample reviews seeded successfully");
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
        }
        catch (error) {
            console.error("❌ Error running seeders:", error);
            throw error;
        }
    }
    async clearAll() {
        try {
            console.log("🗑️ Clearing existing data...");
            await database_1.db.delete(review_1.reviews);
            await database_1.db.delete(payment_1.payments);
            await database_1.db.delete(booking_1.bookings);
            await database_1.db.delete(service_1.serviceAddons);
            await database_1.db.delete(service_1.services);
            await database_1.db.delete(service_1.serviceCategories);
            await database_1.db.delete(stylist_1.stylistSchedules);
            await database_1.db.delete(stylist_1.stylists);
            await database_1.db.delete(review_2.notificationTemplates);
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
const drizzle_orm_1 = require("drizzle-orm");
//# sourceMappingURL=index.js.map