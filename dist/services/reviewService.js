"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const review_1 = require("../models/review");
const drizzle_orm_1 = require("drizzle-orm");
class ReviewService {
    async getOverallAverageRating() {
        try {
            const result = await database_1.db
                .select({
                averageRating: (0, drizzle_orm_1.sql) `AVG(${review_1.reviews.rating})`,
            })
                .from(review_1.reviews)
                .where((0, drizzle_orm_1.eq)(review_1.reviews.isVisible, true));
            return result[0]?.averageRating ? Number(result[0].averageRating) : 0;
        }
        catch (error) {
            console.error("Error calculating overall average rating:", error);
            return 0;
        }
    }
    async getStylistAverageRating(stylistId) {
        try {
            const result = await database_1.db
                .select({
                averageRating: (0, drizzle_orm_1.sql) `AVG(${review_1.reviews.rating})`,
            })
                .from(review_1.reviews)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(review_1.reviews.stylistId, stylistId), (0, drizzle_orm_1.eq)(review_1.reviews.isVisible, true)));
            return result[0]?.averageRating ? Number(result[0].averageRating) : 0;
        }
        catch (error) {
            console.error("Error calculating stylist average rating:", error);
            return 0;
        }
    }
    async getReviewStats() {
        try {
            const [totalReviews, averageRating, ratingDistribution] = await Promise.all([
                database_1.db
                    .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                    .from(review_1.reviews)
                    .where((0, drizzle_orm_1.eq)(review_1.reviews.isVisible, true)),
                this.getOverallAverageRating(),
                database_1.db
                    .select({
                    rating: review_1.reviews.rating,
                    count: (0, drizzle_orm_1.sql) `count(*)`,
                })
                    .from(review_1.reviews)
                    .where((0, drizzle_orm_1.eq)(review_1.reviews.isVisible, true))
                    .groupBy(review_1.reviews.rating)
                    .orderBy((0, drizzle_orm_1.asc)(review_1.reviews.rating)),
            ]);
            const total = totalReviews[0]?.count || 0;
            const distribution = ratingDistribution.map((item) => ({
                rating: item.rating,
                count: Number(item.count),
                percentage: total > 0 ? (Number(item.count) / total) * 100 : 0,
            }));
            return {
                totalReviews: total,
                averageRating: averageRating,
                ratingDistribution: distribution,
            };
        }
        catch (error) {
            console.error("Error getting review stats:", error);
            return {
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: [],
            };
        }
    }
    async getRecentReviews(limit = 10) {
        try {
            const recentReviews = await database_1.db
                .select({
                id: review_1.reviews.id,
                bookingId: review_1.reviews.bookingId,
                customerId: review_1.reviews.customerId,
                stylistId: review_1.reviews.stylistId,
                rating: review_1.reviews.rating,
                comment: review_1.reviews.comment,
                photos: review_1.reviews.photos,
                isAnonymous: review_1.reviews.isAnonymous,
                isVisible: review_1.reviews.isVisible,
                adminNotes: review_1.reviews.adminNotes,
                likes: review_1.reviews.likes,
                dislikes: review_1.reviews.dislikes,
                reportedCount: review_1.reviews.reportedCount,
                isReported: review_1.reviews.isReported,
                createdAt: review_1.reviews.createdAt,
                updatedAt: review_1.reviews.updatedAt,
            })
                .from(review_1.reviews)
                .where((0, drizzle_orm_1.eq)(review_1.reviews.isVisible, true))
                .orderBy((0, drizzle_orm_1.desc)(review_1.reviews.createdAt))
                .limit(limit);
            return recentReviews;
        }
        catch (error) {
            console.error("Error getting recent reviews:", error);
            return [];
        }
    }
    async getStylistReviews(stylistId, limit) {
        try {
            const query = database_1.db
                .select()
                .from(review_1.reviews)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(review_1.reviews.stylistId, stylistId), (0, drizzle_orm_1.eq)(review_1.reviews.isVisible, true)))
                .orderBy((0, drizzle_orm_1.desc)(review_1.reviews.createdAt));
            if (limit) {
                return await query.limit(limit);
            }
            return await query;
        }
        catch (error) {
            console.error("Error getting stylist reviews:", error);
            return [];
        }
    }
    async getCustomerSatisfactionMetrics() {
        try {
            const [totalReviews, averageRating, ratingDistribution, monthlyTrend] = await Promise.all([
                database_1.db
                    .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                    .from(review_1.reviews)
                    .where((0, drizzle_orm_1.eq)(review_1.reviews.isVisible, true)),
                this.getOverallAverageRating(),
                database_1.db
                    .select({
                    rating: review_1.reviews.rating,
                    count: (0, drizzle_orm_1.sql) `count(*)`,
                })
                    .from(review_1.reviews)
                    .where((0, drizzle_orm_1.eq)(review_1.reviews.isVisible, true))
                    .groupBy(review_1.reviews.rating)
                    .orderBy((0, drizzle_orm_1.asc)(review_1.reviews.rating)),
                database_1.db
                    .select({
                    month: (0, drizzle_orm_1.sql) `DATE_FORMAT(${review_1.reviews.createdAt}, '%Y-%m')`,
                    averageRating: (0, drizzle_orm_1.sql) `AVG(${review_1.reviews.rating})`,
                    count: (0, drizzle_orm_1.sql) `COUNT(*)`,
                })
                    .from(review_1.reviews)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(review_1.reviews.isVisible, true), (0, drizzle_orm_1.sql) `${review_1.reviews.createdAt} >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`))
                    .groupBy((0, drizzle_orm_1.sql) `DATE_FORMAT(${review_1.reviews.createdAt}, '%Y-%m')`)
                    .orderBy((0, drizzle_orm_1.sql) `DATE_FORMAT(${review_1.reviews.createdAt}, '%Y-%m') DESC`),
            ]);
            const total = totalReviews[0]?.count || 0;
            const distribution = ratingDistribution.map((item) => ({
                rating: item.rating,
                count: Number(item.count),
                percentage: total > 0 ? (Number(item.count) / total) * 100 : 0,
            }));
            const satisfactionTrend = monthlyTrend.map((item) => ({
                month: item.month,
                rating: Number(item.averageRating) || 0,
                count: Number(item.count) || 0,
            }));
            return {
                totalReviews: total,
                averageRating,
                ratingDistribution: distribution,
                satisfactionTrend,
            };
        }
        catch (error) {
            console.error("Error getting customer satisfaction metrics:", error);
            return {
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: [],
                satisfactionTrend: [],
            };
        }
    }
    async createReview(reviewData) {
        try {
            const result = await database_1.db.insert(review_1.reviews).values(reviewData);
            const insertId = result[0].insertId.toString();
            const createdReview = await this.getReviewById(insertId);
            if (!createdReview) {
                throw new Error("Failed to retrieve created review");
            }
            return createdReview;
        }
        catch (error) {
            console.error("Error creating review:", error);
            throw new Error("Failed to create review");
        }
    }
    async getReviewById(reviewId) {
        try {
            const [review] = await database_1.db
                .select()
                .from(review_1.reviews)
                .where((0, drizzle_orm_1.eq)(review_1.reviews.id, reviewId))
                .limit(1);
            return review || null;
        }
        catch (error) {
            console.error("Error getting review by ID:", error);
            return null;
        }
    }
    async updateReviewVisibility(reviewId, isVisible) {
        try {
            await database_1.db
                .update(review_1.reviews)
                .set({
                isVisible,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(review_1.reviews.id, reviewId));
            return true;
        }
        catch (error) {
            console.error("Error updating review visibility:", error);
            return false;
        }
    }
    async deleteReview(reviewId) {
        try {
            return await this.updateReviewVisibility(reviewId, false);
        }
        catch (error) {
            console.error("Error deleting review:", error);
            return false;
        }
    }
    async getTopRatedStylists(limit = 5) {
        try {
            const topStylists = await database_1.db
                .select({
                stylistId: review_1.reviews.stylistId,
                averageRating: (0, drizzle_orm_1.sql) `AVG(${review_1.reviews.rating})`,
                totalReviews: (0, drizzle_orm_1.sql) `COUNT(*)`,
            })
                .from(review_1.reviews)
                .where((0, drizzle_orm_1.eq)(review_1.reviews.isVisible, true))
                .groupBy(review_1.reviews.stylistId)
                .having((0, drizzle_orm_1.sql) `COUNT(*) >= 3`)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `AVG(${review_1.reviews.rating})`))
                .limit(limit);
            return topStylists.map((stylist) => ({
                stylistId: stylist.stylistId,
                averageRating: Number(stylist.averageRating) || 0,
                totalReviews: Number(stylist.totalReviews) || 0,
            }));
        }
        catch (error) {
            console.error("Error getting top-rated stylists:", error);
            return [];
        }
    }
}
exports.default = new ReviewService();
//# sourceMappingURL=reviewService.js.map