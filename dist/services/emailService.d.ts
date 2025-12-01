interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
declare class EmailService {
    private transporter;
    constructor();
    verifyConnection(): Promise<boolean>;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendPasswordResetOTP(email: string, otp: string, userName?: string): Promise<boolean>;
    sendWelcomeEmail(email: string, userName: string): Promise<boolean>;
    sendBookingConfirmationEmail(email: string, bookingDetails: {
        userName: string;
        serviceName: string;
        stylistName: string;
        date: string;
        time: string;
        totalPrice: number;
    }): Promise<boolean>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=emailService.d.ts.map