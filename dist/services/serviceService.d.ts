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
    getServicesByCategory(category: ServiceCategory): Promise<Service[]>;
    searchServices(query: string, limit?: number): Promise<Service[]>;
    getServiceStats(): Promise<ServiceStats>;
    getPopularServices(limit?: number): Promise<Service[]>;
}
declare const _default: ServiceService;
export default _default;
//# sourceMappingURL=serviceService.d.ts.map