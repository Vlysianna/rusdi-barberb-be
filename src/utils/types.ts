export enum UserRole {
  ADMIN = 'admin',
  STYLIST = 'stylist',
  CUSTOMER = 'customer'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  DIGITAL_WALLET = 'digital_wallet',
  BANK_TRANSFER = 'bank_transfer'
}

export enum NotificationType {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  BOOKING_REMINDER = 'booking_reminder',
  BOOKING_CANCELLED = 'booking_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  REVIEW_REQUEST = 'review_request',
  PROMOTION = 'promotion',
  SYSTEM = 'system'
}

export enum ServiceCategory {
  HAIRCUT = 'haircut',
  BEARD_TRIM = 'beard_trim',
  HAIR_WASH = 'hair_wash',
  STYLING = 'styling',
  COLORING = 'coloring',
  TREATMENT = 'treatment',
  PACKAGE = 'package'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

// User related types
export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends Omit<User, 'password'> {
  dateOfBirth?: Date;
  gender?: Gender;
  address?: string;
  preferences?: string;
}

// Stylist related types
export interface Stylist {
  id: string;
  userId: string;
  specialties: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  bio?: string;
  portfolio?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StylistSchedule {
  id: string;
  stylistId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StylistLeave {
  id: string;
  stylistId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Service related types
export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking related types
export interface Booking {
  id: string;
  customerId: string;
  stylistId: string;
  serviceId: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: BookingStatus;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingDetail extends Booking {
  customer: UserProfile;
  stylist: Stylist & { user: UserProfile };
  service: Service;
  payment?: Payment;
  review?: Review;
}

// Payment related types
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentGatewayResponse?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Review related types
export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  stylistId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewDetail extends Review {
  customer: UserProfile;
  stylist: Stylist & { user: UserProfile };
  booking: Booking & { service: Service };
}

// Notification related types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: string; // JSON string for additional data
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
}

export interface CreateBookingRequest {
  stylistId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}

export interface UpdateBookingRequest {
  appointmentDate?: string;
  appointmentTime?: string;
  status?: BookingStatus;
  notes?: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  category: ServiceCategory;
  price: number;
  duration: number;
  image?: string;
}

export interface UpdateUserProfileRequest {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  preferences?: string;
}

export interface CreateStylistScheduleRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface PaymentRequest {
  bookingId: string;
  method: PaymentMethod;
  amount: number;
}

// Validation schemas types
export interface ValidationError {
  field: string;
  message: string;
}

// Dashboard statistics types
export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalCustomers: number;
  totalStylists: number;
  todayBookings: number;
  pendingBookings: number;
  completedBookings: number;
  averageRating: number;
  monthlyRevenue: number[];
  popularServices: Array<{
    serviceId: string;
    serviceName: string;
    bookingCount: number;
  }>;
  topStylists: Array<{
    stylistId: string;
    stylistName: string;
    rating: number;
    totalBookings: number;
  }>;
}

// Email template types
export interface EmailTemplate {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// File upload types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}
