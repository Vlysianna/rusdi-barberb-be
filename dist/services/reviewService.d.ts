import { NewReview, Review } from "../models/review";
declare class ReviewService {
    getOverallAverageRating(): Promise<number>;
    getStylistAverageRating(stylistId: string): Promise<number>;
    getReviewStats(): Promise<{
        totalReviews: number;
        averageRating: number;
        ratingDistribution: {
            rating: number;
            count: number;
            percentage: number;
        }[];
    }>;
    getRecentReviews(limit?: number): Promise<Review[]>;
    getStylistReviews(stylistId: string, limit?: number): Promise<Review[]>;
    getCustomerSatisfactionMetrics(): Promise<{
        totalReviews: number;
        averageRating: number;
        ratingDistribution: {
            rating: number;
            count: number;
            percentage: number;
        }[];
        satisfactionTrend: {
            month: string;
            rating: number;
            count: number;
        }[];
    }>;
    createReview(reviewData: NewReview): Promise<Review>;
    getReviewById(reviewId: string): Promise<Review | null>;
    updateReviewVisibility(reviewId: string, isVisible: boolean): Promise<boolean>;
    deleteReview(reviewId: string): Promise<boolean>;
    getTopRatedStylists(limit?: number): Promise<{
        stylistId: string;
        averageRating: number;
        totalReviews: number;
    }[]>;
}
declare const _default: ReviewService;
export default _default;
//# sourceMappingURL=reviewService.d.ts.map