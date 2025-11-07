import { db } from "../config/database";
import { reviews } from "../models/review";
import { bookings } from "../models/booking";
import { users } from "../models/user";
import { stylists } from "../models/stylist";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import { NewReview, Review } from "../models/review";

class ReviewService {
  /**
   * Calculate overall average rating across all reviews
   */
  async getOverallAverageRating(): Promise<number> {
    try {
      const result = await db
        .select({
          averageRating: sql<number>`AVG(${reviews.rating})`,
        })
        .from(reviews)
        .where(eq(reviews.isVisible, true));

      return result[0]?.averageRating ? Number(result[0].averageRating) : 0;
    } catch (error) {
      console.error("Error calculating overall average rating:", error);
      return 0;
    }
  }

  /**
   * Get average rating for a specific stylist
   */
  async getStylistAverageRating(stylistId: string): Promise<number> {
    try {
      const result = await db
        .select({
          averageRating: sql<number>`AVG(${reviews.rating})`,
        })
        .from(reviews)
        .where(
          and(eq(reviews.stylistId, stylistId), eq(reviews.isVisible, true)),
        );

      return result[0]?.averageRating ? Number(result[0].averageRating) : 0;
    } catch (error) {
      console.error("Error calculating stylist average rating:", error);
      return 0;
    }
  }

  /**
   * Get review statistics
   */
  async getReviewStats() {
    try {
      const [totalReviews, averageRating, ratingDistribution] =
        await Promise.all([
          // Total reviews count
          db
            .select({ count: sql<number>`count(*)` })
            .from(reviews)
            .where(eq(reviews.isVisible, true)),

          // Average rating
          this.getOverallAverageRating(),

          // Rating distribution
          db
            .select({
              rating: reviews.rating,
              count: sql<number>`count(*)`,
            })
            .from(reviews)
            .where(eq(reviews.isVisible, true))
            .groupBy(reviews.rating)
            .orderBy(asc(reviews.rating)),
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
    } catch (error) {
      console.error("Error getting review stats:", error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [],
      };
    }
  }

  /**
   * Get recent reviews with customer and stylist info
   */
  async getRecentReviews(limit: number = 10): Promise<Review[]> {
    try {
      const recentReviews = await db
        .select({
          id: reviews.id,
          bookingId: reviews.bookingId,
          customerId: reviews.customerId,
          stylistId: reviews.stylistId,
          rating: reviews.rating,
          comment: reviews.comment,
          photos: reviews.photos,
          isAnonymous: reviews.isAnonymous,
          isVisible: reviews.isVisible,
          adminNotes: reviews.adminNotes,
          likes: reviews.likes,
          dislikes: reviews.dislikes,
          reportedCount: reviews.reportedCount,
          isReported: reviews.isReported,
          createdAt: reviews.createdAt,
          updatedAt: reviews.updatedAt,
        })
        .from(reviews)
        .where(eq(reviews.isVisible, true))
        .orderBy(desc(reviews.createdAt))
        .limit(limit);

      return recentReviews;
    } catch (error) {
      console.error("Error getting recent reviews:", error);
      return [];
    }
  }

  /**
   * Get reviews for a specific stylist
   */
  async getStylistReviews(
    stylistId: string,
    limit?: number,
  ): Promise<Review[]> {
    try {
      const query = db
        .select()
        .from(reviews)
        .where(
          and(eq(reviews.stylistId, stylistId), eq(reviews.isVisible, true)),
        )
        .orderBy(desc(reviews.createdAt));

      if (limit) {
        return await query.limit(limit);
      }

      return await query;
    } catch (error) {
      console.error("Error getting stylist reviews:", error);
      return [];
    }
  }

  /**
   * Get customer satisfaction metrics
   */
  async getCustomerSatisfactionMetrics() {
    try {
      const [totalReviews, averageRating, ratingDistribution, monthlyTrend] =
        await Promise.all([
          // Total reviews
          db
            .select({ count: sql<number>`count(*)` })
            .from(reviews)
            .where(eq(reviews.isVisible, true)),

          // Average rating
          this.getOverallAverageRating(),

          // Rating distribution
          db
            .select({
              rating: reviews.rating,
              count: sql<number>`count(*)`,
            })
            .from(reviews)
            .where(eq(reviews.isVisible, true))
            .groupBy(reviews.rating)
            .orderBy(asc(reviews.rating)),

          // Monthly trend for the last 6 months
          db
            .select({
              month: sql<string>`DATE_FORMAT(${reviews.createdAt}, '%Y-%m')`,
              averageRating: sql<number>`AVG(${reviews.rating})`,
              count: sql<number>`COUNT(*)`,
            })
            .from(reviews)
            .where(
              and(
                eq(reviews.isVisible, true),
                sql`${reviews.createdAt} >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`,
              ),
            )
            .groupBy(sql`DATE_FORMAT(${reviews.createdAt}, '%Y-%m')`)
            .orderBy(sql`DATE_FORMAT(${reviews.createdAt}, '%Y-%m') DESC`),
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
    } catch (error) {
      console.error("Error getting customer satisfaction metrics:", error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [],
        satisfactionTrend: [],
      };
    }
  }

  /**
   * Create a new review
   */
  async createReview(reviewData: NewReview): Promise<Review> {
    try {
      const result = await db.insert(reviews).values(reviewData);
      const insertId = result[0].insertId.toString();

      // Fetch the created review
      const createdReview = await this.getReviewById(insertId);
      if (!createdReview) {
        throw new Error("Failed to retrieve created review");
      }

      return createdReview;
    } catch (error) {
      console.error("Error creating review:", error);
      throw new Error("Failed to create review");
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string): Promise<Review | null> {
    try {
      const [review] = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, reviewId))
        .limit(1);

      return review || null;
    } catch (error) {
      console.error("Error getting review by ID:", error);
      return null;
    }
  }

  /**
   * Update review visibility
   */
  async updateReviewVisibility(
    reviewId: string,
    isVisible: boolean,
  ): Promise<boolean> {
    try {
      await db
        .update(reviews)
        .set({
          isVisible,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, reviewId));

      return true;
    } catch (error) {
      console.error("Error updating review visibility:", error);
      return false;
    }
  }

  /**
   * Delete review (soft delete by making invisible)
   */
  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      return await this.updateReviewVisibility(reviewId, false);
    } catch (error) {
      console.error("Error deleting review:", error);
      return false;
    }
  }

  /**
   * Get top-rated stylists
   */
  async getTopRatedStylists(limit: number = 5) {
    try {
      const topStylists = await db
        .select({
          stylistId: reviews.stylistId,
          averageRating: sql<number>`AVG(${reviews.rating})`,
          totalReviews: sql<number>`COUNT(*)`,
        })
        .from(reviews)
        .where(eq(reviews.isVisible, true))
        .groupBy(reviews.stylistId)
        .having(sql`COUNT(*) >= 3`) // At least 3 reviews
        .orderBy(desc(sql`AVG(${reviews.rating})`))
        .limit(limit);

      return topStylists.map((stylist) => ({
        stylistId: stylist.stylistId,
        averageRating: Number(stylist.averageRating) || 0,
        totalReviews: Number(stylist.totalReviews) || 0,
      }));
    } catch (error) {
      console.error("Error getting top-rated stylists:", error);
      return [];
    }
  }
}

export default new ReviewService();
