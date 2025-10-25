# Rusdi Barber API

A comprehensive barber shop booking and management system API built with Node.js, Express, TypeScript, and MySQL.

## 🚀 Features

### Core Modules
- **Auth Module** ✅ - JWT authentication, role-based access control
- **User Module** ✅ - User management, profiles, and file uploads  
- **Stylist Module** ✅ - Stylist profiles, schedules, and availability
- **Service Module** ✅ - Service catalog, categories, and pricing management
- **Booking Module** ✅ - Appointment booking with conflict validation
- **Payment Module** ✅ - Dummy payment processing and webhooks
- **Review Module** ✅ - Customer reviews and ratings (schema ready)
- **Notification Module** ✅ - Multi-channel notifications (schema & templates ready)

### Authentication & Security
- JWT access and refresh tokens
- Role-based permissions (Admin/Stylist/Customer)
- Password hashing with bcrypt
- Request validation with Joi
- Rate limiting
- CORS protection
- Security headers

### Database Features
- MySQL with Drizzle ORM
- Comprehensive schema design
- Audit trails and history tracking
- Soft deletes and status management
- Optimized indexes and relationships

## 📋 Project Status

**Current Version:** 1.0.0-alpha  
**Status:** Foundation Complete - Business Logic In Development

### ✅ Completed
- [x] Project structure and TypeScript setup
- [x] Express application with middleware
- [x] Authentication system (register, login, JWT)
- [x] User management system (CRUD, profiles, file uploads)
- [x] Service management system (services, categories, addons)
- [x] Stylist management system (profiles, schedules)
- [x] Booking system with conflict validation
- [x] Payment processing (dummy implementation)
- [x] Review system (database schema and templates)
- [x] Notification system (templates and preferences)
- [x] Database schemas for all modules
- [x] Error handling and API response utilities
- [x] Security middleware and validation
- [x] Comprehensive database seeders
- [x] File upload functionality
- [x] Development environment setup

### 🚧 In Progress
- [ ] TypeScript compilation fixes
- [ ] Final testing and debugging
- [ ] API documentation (Swagger)
- [ ] Integration testing

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL 8.0+
- **ORM:** Drizzle ORM
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi
- **Password:** bcryptjs
- **Environment:** dotenv
- **Development:** ts-node, nodemon

## 📁 Project Structure

```
rusdi-barber-be/
├── src/
│   ├── config/           # Database & JWT configuration
│   ├── middleware/       # Auth, validation, error handling
│   ├── models/          # Drizzle ORM schemas
│   ├── controllers/     # Route controllers
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   └── utils/           # Utilities and types
├── scripts/             # Database and deployment scripts
├── drizzle/            # Migration files (auto-generated)
├── uploads/            # File upload directory
└── docs/              # API documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MySQL 8.0 or higher
- npm or yarn package manager

### 1. Clone Repository
```bash
git clone <repository-url>
cd rusdi-barber-be
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
nano .env
```

### 4. Database Setup
```bash
# Login to MySQL as root
mysql -u root -p

# Run setup script
source scripts/setup-database.sql

# Or manually create database
CREATE DATABASE rusdi_barber_db;
```

### 5. Update Environment Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=rusdi_barber
DB_PASSWORD=rusdi_barber_2024!
DB_NAME=rusdi_barber_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 6. Generate and Run Migrations
```bash
# Generate migration files
npx drizzle-kit generate

# Run migrations (when implemented)
npx drizzle-kit migrate
```

### 7. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
Development: http://localhost:3000
Production: https://api.rusdibarber.com
```

### API Endpoints

#### System Endpoints
- `GET /` - API documentation
- `GET /health` - Health check

#### Authentication (✅ Complete)
```
POST   /api/auth/register           # Register new user
POST   /api/auth/login              # User login
POST   /api/auth/refresh            # Refresh access token
GET    /api/auth/profile            # Get user profile
PUT    /api/auth/profile            # Update user profile
POST   /api/auth/change-password    # Change password
POST   /api/auth/forgot-password    # Request password reset
POST   /api/auth/reset-password     # Reset password with token
POST   /api/auth/verify-email       # Verify email address
POST   /api/auth/logout             # Logout user
GET    /api/auth/check              # Check authentication status

# Admin Only
GET    /api/auth/users/:id          # Get user by ID
PUT    /api/auth/users/:id/activate   # Activate user account  
PUT    /api/auth/users/:id/deactivate # Deactivate user account
```

#### Users (✅ Complete)
```
GET    /api/users                   # List users (paginated)
POST   /api/users                   # Create new user
GET    /api/users/stats             # Get user statistics
GET    /api/users/search            # Search users
PUT    /api/users/bulk              # Bulk update users
GET    /api/users/export            # Export users data
GET    /api/users/:id               # Get user details
PUT    /api/users/:id               # Update user
DELETE /api/users/:id               # Delete user
POST   /api/users/:id/avatar        # Upload user avatar
GET    /api/users/:id/activity      # Get user activity
```

#### Stylists (✅ Complete)
```
GET    /api/stylists               # List stylists
POST   /api/stylists               # Create stylist profile
GET    /api/stylists/stats         # Get stylist statistics
GET    /api/stylists/search        # Search stylists
GET    /api/stylists/:id           # Get stylist details
PUT    /api/stylists/:id           # Update stylist profile
DELETE /api/stylists/:id           # Delete stylist
POST   /api/stylists/:id/portfolio # Upload portfolio images

# Schedule Management
GET    /api/stylists/:id/schedule  # Get stylist schedule
PUT    /api/stylists/:id/schedule  # Update schedule
POST   /api/stylists/:id/leave     # Request leave
GET    /api/stylists/:id/reviews   # Get stylist reviews
```

#### Services (✅ Complete)
```
GET    /api/services               # List services
POST   /api/services               # Create service
GET    /api/services/stats         # Get service statistics
GET    /api/services/popular       # Get popular services
GET    /api/services/search        # Search services
PUT    /api/services/bulk          # Bulk update services
GET    /api/services/:id           # Get service details
PUT    /api/services/:id           # Update service
DELETE /api/services/:id           # Delete service
POST   /api/services/:id/image     # Upload service image

# Categories
GET    /api/services/categories    # List categories
POST   /api/services/categories    # Create category
PUT    /api/services/categories/:id # Update category
DELETE /api/services/categories/:id # Delete category

# Addons
GET    /api/services/:id/addons    # Get service addons
POST   /api/services/:id/addons    # Create service addon
PUT    /api/services/addons/:id    # Update addon
DELETE /api/services/addons/:id    # Delete addon
```

#### Bookings (✅ Complete)
```
GET    /api/bookings               # List bookings (filtered by role)
POST   /api/bookings               # Create booking
GET    /api/bookings/time-slots    # Get available time slots
GET    /api/bookings/stats         # Get booking statistics (Admin)
GET    /api/bookings/:id           # Get booking details
PUT    /api/bookings/:id           # Update booking
PUT    /api/bookings/:id/reschedule # Reschedule booking
PUT    /api/bookings/:id/cancel    # Cancel booking

# Status Management
PUT    /api/bookings/:id/confirm   # Confirm booking (Stylist/Admin)
PUT    /api/bookings/:id/start     # Start booking (Stylist)
PUT    /api/bookings/:id/complete  # Complete booking (Stylist/Admin)
PUT    /api/bookings/:id/no-show   # Mark as no-show (Stylist/Admin)

# Customer & Stylist specific
GET    /api/bookings/customer/:customerId/history # Customer history
GET    /api/bookings/stylist/:stylistId/schedule  # Stylist schedule
```

#### Payments (✅ Complete - Dummy Implementation)
```
GET    /api/payments               # List payments (filtered by role)
GET    /api/payments/methods       # Get available payment methods
POST   /api/payments               # Create payment
GET    /api/payments/stats         # Get payment statistics (Admin)
GET    /api/payments/:id           # Get payment details
POST   /api/payments/:id/process   # Process payment (Dummy gateway)
POST   /api/payments/:id/retry     # Retry failed payment
GET    /api/payments/:id/receipt   # Get payment receipt
POST   /api/payments/:id/refund    # Process refund (Admin/Stylist)

# Customer specific
GET    /api/payments/customer/:customerId/history # Payment history

# Webhooks
POST   /api/payments/webhooks/:provider # Payment gateway webhooks
```

#### Reviews (✅ Schema Ready - Implementation Pending)
```
GET    /api/reviews                # List reviews
POST   /api/reviews                # Create review
GET    /api/reviews/:id            # Get review details
PUT    /api/reviews/:id            # Update review
DELETE /api/reviews/:id            # Delete review

# Reactions
POST   /api/reviews/:id/like       # Like review
POST   /api/reviews/:id/report     # Report review
```

#### Notifications (✅ Schema Ready - Implementation Pending)
```
GET    /api/notifications          # Get user notifications
PUT    /api/notifications/:id/read # Mark as read
DELETE /api/notifications/:id      # Delete notification
PUT    /api/notifications/read-all # Mark all as read

# Preferences
GET    /api/notifications/preferences # Get preferences
PUT    /api/notifications/preferences # Update preferences
```

## 🔧 Development

### Available Scripts
```bash
npm run dev         # Start development server with hot reload
npm run build       # Build production bundle
npm start           # Start production server
npm run seed        # Run database seeders
npm run seed:fresh  # Clear database and run fresh seeders
```

### Database Operations
```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Launch Drizzle Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run seed

# Fresh seed (clear and reseed)
npm run seed:fresh
```

### Testing API Endpoints

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "Password123",
    "fullName": "John Customer",
    "phone": "081234567890"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "Password123"
  }'
```

#### Access Protected Route
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Security Features

- **JWT Authentication** with secure token generation
- **Role-Based Access Control** (Admin/Stylist/Customer)
- **Password Security** with bcrypt hashing
- **Request Validation** using Joi schemas
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin security
- **Security Headers** (XSS, CSRF protection)
- **Input Sanitization** and SQL injection prevention

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and profiles
- **stylists** - Stylist information and specialties
- **services** - Service catalog and pricing
- **bookings** - Appointment bookings
- **payments** - Payment transactions
- **reviews** - Customer reviews and ratings
- **notifications** - System notifications

### Support Tables
- **stylist_schedules** - Working hours and availability
- **stylist_leaves** - Leave requests and approvals
- **service_categories** - Service categorization
- **service_addons** - Additional service options
- **booking_history** - Audit trail for bookings
- **payment_methods** - Saved payment methods
- **notification_templates** - Email/SMS templates
- **notification_preferences** - User notification settings

## 🚀 Deployment

### Production Checklist
- [ ] Set strong JWT secret
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Configure rate limiting
- [ ] Set up health checks

### Environment Variables (Production)
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DB_HOST=<production-db-host>
DB_PASSWORD=<secure-password>
CORS_ORIGIN=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation
- Maintain code coverage above 80%

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@rusdibarber.com
- Documentation: [API Docs](http://localhost:3000)

## 🗺️ Roadmap

### Phase 1: Core Implementation (95% Complete)
- [x] Authentication system
- [x] User management system
- [x] Service management system  
- [x] Stylist management system
- [x] Booking system with conflict validation
- [x] Payment processing (dummy implementation)
- [x] Review & notification schemas
- [x] Comprehensive database seeders

### Phase 2: Advanced Features (Next)
- [ ] Fix TypeScript compilation issues
- [ ] Complete review and notification controllers
- [ ] Real payment gateway integration (Midtrans, Stripe, etc.)
- [ ] Real-time notifications with WebSocket
- [ ] Email/SMS notification delivery
- [ ] Advanced reporting and analytics
- [ ] Mobile app API support

### Phase 3: Analytics & Optimization (Future)
- [ ] Business analytics dashboard
- [ ] Performance optimization
- [ ] Advanced reporting
- [ ] Machine learning recommendations

## 🎯 Quick Start Guide

### 1. Database Setup & Seeding
```bash
# Create database (run setup-database.sql in MySQL)
mysql -u root -p < scripts/setup-database.sql

# Generate and run migrations
npm run db:generate
npm run db:migrate

# Seed with sample data
npm run seed:fresh
```

### 2. Test the API
```bash
# Start server
npm run dev

# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rusdibarber.com","password":"Admin123!"}'

# Get all users (use token from login)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Rusdi Barber API** - Built with ❤️ using Node.js and TypeScript