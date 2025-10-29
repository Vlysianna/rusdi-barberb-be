import { eq, like, and, or, count, desc, asc, gte, lte } from "drizzle-orm";
import { db } from "../config/database";
import { services, type Service, type NewService } from "../models/service";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  DatabaseError,
} from "../middleware/errorHandler";
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

class ServiceService {
  /**
   * Get all services with pagination and filters
   */
  async getServices(params: GetServicesParams): Promise<GetServicesResult> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        isActive,
        sortBy = "createdAt",
        sortOrder = "desc",
        minPrice,
        maxPrice,
      } = params;

      const offset = (page - 1) * limit;
      const conditions = [];

      // Search filter
      if (search) {
        conditions.push(
          or(
            like(services.name, `%${search}%`),
            like(services.description, `%${search}%`),
          ),
        );
      }

      // Category filter
      if (category) {
        conditions.push(eq(services.category, category));
      }

      // Active status filter
      if (typeof isActive === "boolean") {
        conditions.push(eq(services.isActive, isActive));
      }

      // Price range filter
      if (minPrice !== undefined) {
        conditions.push(gte(services.price, minPrice.toString()));
      }

      if (maxPrice !== undefined) {
        conditions.push(lte(services.price, maxPrice.toString()));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Sort configuration
      const sortColumn =
        sortBy === "name"
          ? services.name
          : sortBy === "price"
            ? services.price
            : sortBy === "duration"
              ? services.duration
              : services.createdAt;

      const orderBy = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

      // Get services with pagination
      const servicesList = await db
        .select()
        .from(services)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(services)
        .where(whereClause);

      return {
        services: servicesList,
        total: totalResult.count,
      };
    } catch (error) {
      throw new DatabaseError("Failed to fetch services");
    }
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<Service> {
    try {
      const [service] = await db
        .select()
        .from(services)
        .where(eq(services.id, id))
        .limit(1);

      if (!service) {
        throw new NotFoundError("Service not found");
      }

      return service;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch service");
    }
  }

  /**
   * Create new service
   */
  async createService(serviceData: {
    name: string;
    description: string;
    category: ServiceCategory;
    price: number;
    duration: number;
    image?: string;
  }): Promise<Service> {
    try {
      // Check if service with same name already exists
      const [existingService] = await db
        .select()
        .from(services)
        .where(eq(services.name, serviceData.name))
        .limit(1);

      if (existingService) {
        throw new ConflictError("Service with this name already exists");
      }

      // Validate input
      if (serviceData.price <= 0) {
        throw new BadRequestError("Service price must be greater than 0");
      }

      if (serviceData.duration <= 0) {
        throw new BadRequestError("Service duration must be greater than 0");
      }

      const newServiceData: NewService = {
        name: serviceData.name,
        description: serviceData.description,
        category: serviceData.category,
        price: serviceData.price.toString(),
        duration: serviceData.duration,
        image: serviceData.image,
        isActive: true,
      };

      // Insert service
      const [insertResult] = await db.insert(services).values(newServiceData);

      // Get created service
      const [createdService] = await db
        .select()
        .from(services)
        .where(eq(services.id, insertResult.insertId.toString()))
        .limit(1);

      if (!createdService) {
        throw new DatabaseError("Failed to create service");
      }

      return createdService;
    } catch (error) {
      if (error instanceof ConflictError || error instanceof BadRequestError) {
        throw error;
      }
      throw new DatabaseError("Failed to create service");
    }
  }

  /**
   * Update service
   */
  async updateService(
    id: string,
    updateData: {
      name?: string;
      description?: string;
      category?: ServiceCategory;
      price?: number;
      duration?: number;
      image?: string;
      isActive?: boolean;
    },
  ): Promise<Service> {
    try {
      // Check if service exists
      const existingService = await this.getServiceById(id);

      // Check if new name conflicts with existing service
      if (updateData.name && updateData.name !== existingService.name) {
        const [nameConflict] = await db
          .select()
          .from(services)
          .where(and(eq(services.name, updateData.name), eq(services.id, id)))
          .limit(1);

        if (nameConflict) {
          throw new ConflictError("Service with this name already exists");
        }
      }

      // Validate input
      if (updateData.price !== undefined && updateData.price <= 0) {
        throw new BadRequestError("Service price must be greater than 0");
      }

      if (updateData.duration !== undefined && updateData.duration <= 0) {
        throw new BadRequestError("Service duration must be greater than 0");
      }

      const updateFields: Partial<NewService> = {
        ...updateData,
        price: updateData.price?.toString(),
        updatedAt: new Date(),
      };

      // Update service
      await db.update(services).set(updateFields).where(eq(services.id, id));

      // Get updated service
      const updatedService = await this.getServiceById(id);
      return updatedService;
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ConflictError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
      throw new DatabaseError("Failed to update service");
    }
  }

  /**
   * Delete service
   */
  async deleteService(id: string): Promise<void> {
    try {
      // Check if service exists
      await this.getServiceById(id);

      // Delete service
      await db.delete(services).where(eq(services.id, id));
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete service");
    }
  }

  /**
   * Toggle service active status
   */
  async toggleServiceStatus(id: string): Promise<Service> {
    try {
      const service = await this.getServiceById(id);

      await db
        .update(services)
        .set({
          isActive: !service.isActive,
          updatedAt: new Date(),
        })
        .where(eq(services.id, id));

      return await this.getServiceById(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError("Failed to toggle service status");
    }
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(category: ServiceCategory): Promise<Service[]> {
    try {
      return await db
        .select()
        .from(services)
        .where(
          and(eq(services.category, category), eq(services.isActive, true)),
        )
        .orderBy(asc(services.name));
    } catch (error) {
      throw new DatabaseError("Failed to fetch services by category");
    }
  }

  /**
   * Search services
   */
  async searchServices(query: string, limit: number = 10): Promise<Service[]> {
    try {
      return await db
        .select()
        .from(services)
        .where(
          and(
            or(
              like(services.name, `%${query}%`),
              like(services.description, `%${query}%`),
            ),
            eq(services.isActive, true),
          ),
        )
        .orderBy(asc(services.name))
        .limit(limit);
    } catch (error) {
      throw new DatabaseError("Failed to search services");
    }
  }

  /**
   * Get service statistics
   */
  async getServiceStats(): Promise<ServiceStats> {
    try {
      // Get total services
      const [totalResult] = await db.select({ count: count() }).from(services);

      // Get active services
      const [activeResult] = await db
        .select({ count: count() })
        .from(services)
        .where(eq(services.isActive, true));

      // Get services by category
      const categoryStats = await db
        .select({
          category: services.category,
          count: count(),
        })
        .from(services)
        .where(eq(services.isActive, true))
        .groupBy(services.category);

      const servicesByCategory = categoryStats.reduce(
        (acc, stat) => {
          acc[stat.category] = stat.count;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Get average price and duration
      const activeServices = await db
        .select()
        .from(services)
        .where(eq(services.isActive, true));

      const averagePrice =
        activeServices.length > 0
          ? activeServices.reduce(
              (sum, service) => sum + parseFloat(service.price),
              0,
            ) / activeServices.length
          : 0;

      const averageDuration =
        activeServices.length > 0
          ? activeServices.reduce((sum, service) => sum + service.duration, 0) /
            activeServices.length
          : 0;

      return {
        totalServices: totalResult.count,
        activeServices: activeResult.count,
        servicesByCategory,
        averagePrice: Math.round(averagePrice * 100) / 100, // Round to 2 decimal places
        averageDuration: Math.round(averageDuration),
      };
    } catch (error) {
      throw new DatabaseError("Failed to get service statistics");
    }
  }

  /**
   * Get popular services (most booked)
   */
  async getPopularServices(limit: number = 5): Promise<Service[]> {
    try {
      // For now, return most recently created services
      // In a real implementation, you'd join with bookings table to get actual popularity
      return await db
        .select()
        .from(services)
        .where(eq(services.isActive, true))
        .orderBy(desc(services.createdAt))
        .limit(limit);
    } catch (error) {
      throw new DatabaseError("Failed to get popular services");
    }
  }
}

export default new ServiceService();
