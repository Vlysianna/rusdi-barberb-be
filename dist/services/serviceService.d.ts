import { type Service } from "../models/service";
import { ServiceCategory } from "../utils/types";
interface GetServicesParams {
    page: number;
    limit: number;
    search?: string;
    category?: ServiceCategory;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    minPrice?: number;
    maxPrice?: number;
}
interface GetServicesResult {
    services: Service[];
    total: number;
}
interface ServiceStats {
    totalServices: number;
    activeServices: number;
    servicesByCategory: Record<string, number>;
    averagePrice: number;
    averageDuration: number;
}
declare class ServiceService {
    getServices(params: GetServicesParams): Promise<GetServicesResult>;
    getServiceById(id: string): Promise<Service>;
    createService(serviceData: {
        name: string;
        description: string;
        category: ServiceCategory;
        price: number;
        duration: number;
        image?: string;
    }): Promise<Service>;
    updateService(id: string, updateData: {
        name?: string;
        description?: string;
        category?: ServiceCategory;
        price?: number;
        duration?: number;
        image?: string;
        isActive?: boolean;
    }): Promise<Service>;
    deleteService(id: string): Promise<void>;
    toggleServiceStatus(id: string): Promise<Service>;
    getActiveServices(): Promise<Service[]>;
    getServicesByCategory(category: string): Promise<Service[]>;
    searchServices(query: string, limit?: number): Promise<Service[]>;
    getServiceStats(): Promise<ServiceStats>;
    getServiceCategories(): Promise<{
        value: string;
        label: string;
        count: number;
    }[]>;
    updateServiceStatus(id: string, isActive: boolean): Promise<Service>;
    toggleServicePopularity(id: string): Promise<Service>;
    getServiceAnalytics(id: string, dateFrom?: string, dateTo?: string): Promise<any>;
    getServiceAvailability(id: string, date: string, time: string): Promise<any>;
    getRecommendedServices(customerId?: string): Promise<Service[]>;
    exportServices(format?: "csv" | "excel"): Promise<string>;
    getServicesByStylist(stylistId: string): Promise<Service[]>;
    getServiceReviews(id: string, page?: number, limit?: number): Promise<any>;
    getServicePricingHistory(id: string): Promise<any>;
    bulkUpdateServices(serviceIds: string[], updates: Partial<any>): Promise<Service[]>;
    getPopularServices(limit?: number): Promise<Service[]>;
}
declare const _default: ServiceService;
export default _default;
//# sourceMappingURL=serviceService.d.ts.map