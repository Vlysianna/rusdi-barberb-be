"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gender = exports.ServiceCategory = exports.NotificationType = exports.PaymentMethod = exports.PaymentStatus = exports.BookingStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["STYLIST"] = "stylist";
    UserRole["CUSTOMER"] = "customer";
})(UserRole || (exports.UserRole = UserRole = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["IN_PROGRESS"] = "in_progress";
    BookingStatus["COMPLETED"] = "completed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["NO_SHOW"] = "no_show";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["DEBIT_CARD"] = "debit_card";
    PaymentMethod["DIGITAL_WALLET"] = "digital_wallet";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["BOOKING_CONFIRMATION"] = "booking_confirmation";
    NotificationType["BOOKING_REMINDER"] = "booking_reminder";
    NotificationType["BOOKING_CANCELLED"] = "booking_cancelled";
    NotificationType["PAYMENT_SUCCESS"] = "payment_success";
    NotificationType["PAYMENT_FAILED"] = "payment_failed";
    NotificationType["REVIEW_REQUEST"] = "review_request";
    NotificationType["PROMOTION"] = "promotion";
    NotificationType["SYSTEM"] = "system";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var ServiceCategory;
(function (ServiceCategory) {
    ServiceCategory["HAIRCUT"] = "haircut";
    ServiceCategory["BEARD_TRIM"] = "beard_trim";
    ServiceCategory["HAIR_WASH"] = "hair_wash";
    ServiceCategory["STYLING"] = "styling";
    ServiceCategory["COLORING"] = "coloring";
    ServiceCategory["TREATMENT"] = "treatment";
    ServiceCategory["PACKAGE"] = "package";
})(ServiceCategory || (exports.ServiceCategory = ServiceCategory = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
})(Gender || (exports.Gender = Gender = {}));
//# sourceMappingURL=types.js.map