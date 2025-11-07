import { type Payment } from "../models/payment";
import { PaymentStatus, PaymentMethod } from "../utils/types";
interface GetPaymentsParams {
    page: number;
    limit: number;
    bookingId?: string;
    customerId?: string;
    status?: PaymentStatus;
    method?: PaymentMethod;
    startDate?: Date;
    endDate?: Date;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
interface PaymentWithDetails extends Payment {
    booking: {
        id: string;
        appointmentDate: Date;
        appointmentTime: string;
        totalAmount: number;
        status: string;
    };
    customer: {
        id: string;
        fullName: string;
        email: string;
        phone?: string;
    };
}
declare class PaymentService {
    getPayments(params: GetPaymentsParams): Promise<{
        payments: PaymentWithDetails[];
        total: number;
    }>;
    getPaymentById(paymentId: string): Promise<PaymentWithDetails | null>;
    createPayment(data: {
        bookingId: string;
        method: PaymentMethod;
        amount: number;
        customerId?: string;
    }): Promise<PaymentWithDetails>;
    updatePaymentStatus(paymentId: string, status: PaymentStatus, transactionId?: string, gatewayResponse?: any): Promise<PaymentWithDetails>;
    processRefund(paymentId: string, refundAmount?: number, reason?: string): Promise<PaymentWithDetails>;
    getPaymentStats(startDate?: Date, endDate?: Date): Promise<{
        statusBreakdown: {
            status: "pending" | "cancelled" | "paid" | "failed" | "refunded";
            count: number;
        }[];
        methodBreakdown: {
            method: "cash" | "credit_card" | "debit_card" | "digital_wallet" | "bank_transfer";
            count: number;
        }[];
        totalRevenue: number;
        paidPaymentsCount: number;
    }>;
    private processPaymentGateway;
    private processRefundGateway;
}
declare const _default: PaymentService;
export default _default;
//# sourceMappingURL=paymentService.d.ts.map