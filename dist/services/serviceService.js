"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../config/database");
const service_1 = require("../models/service");
const errorHandler_1 = require("../middleware/errorHandler");
class ServiceService {
    async getServices(params) {
        try {
            const { page = 1, limit = 10, search, category, isActive, sortBy = "createdAt", sortOrder = "desc", minPrice, maxPrice, } = params;
            const offset = (page - 1) * limit;
            const conditions = [];
            if (search) {
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(service_1.services.name, `%${search}%`), (0, drizzle_orm_1.like)(service_1.services.description, `%${search}%`)));
            }
            if (category) {
                conditions.push((0, drizzle_orm_1.eq)(service_1.services.category, category));
            }
            if (typeof isActive === "boolean") {
                conditions.push((0, drizzle_orm_1.eq)(service_1.services.isActive, isActive));
            }
            if (minPrice !== undefined) {
                conditions.push((0, drizzle_orm_1.gte)(service_1.services.price, minPrice.toString()));
            }
            if (maxPrice !== undefined) {
                conditions.push((0, drizzle_orm_1.lte)(service_1.services.price, maxPrice.toString()));
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            const sortColumn = sortBy === "name"
                ? service_1.services.name
                : sortBy === "price"
                    ? service_1.services.price
                    : sortBy === "duration"
                        ? service_1.services.duration
                        : service_1.services.createdAt;
            const orderBy = sortOrder === "asc" ? (0, drizzle_orm_1.asc)(sortColumn) : (0, drizzle_orm_1.desc)(sortColumn);
            const servicesList = await database_1.db
                .select()
                .from(service_1.services)
                .where(whereClause)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset);
            const [totalResult] = await database_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(service_1.services)
                .where(whereClause);
            return {
                services: servicesList,
                total: totalResult.count,
            };
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to fetch services");
        }
    }
    async getServiceById(id) {
        try {
            const [service] = await database_1.db
                .select()
                .from(service_1.services)
                .where((0, drizzle_orm_1.eq)(service_1.services.id, id))
                .limit(1);
            if (!service) {
                throw new errorHandler_1.NotFoundError("Service not found");
            }
            return service;
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to fetch service");
        }
    }
    async createService(serviceData) {
        try {
            const [existingService] = await database_1.db
                .select()
                .from(service_1.services)
                .where((0, drizzle_orm_1.eq)(service_1.services.name, serviceData.name))
                .limit(1);
            if (existingService) {
                throw new errorHandler_1.ConflictError("Service with this name already exists");
            }
            if (serviceData.price <= 0) {
                throw new errorHandler_1.BadRequestError("Service price must be greater than 0");
            }
            if (serviceData.duration <= 0) {
                throw new errorHandler_1.BadRequestError("Service duration must be greater than 0");
            }
            const newServiceData = {
                name: serviceData.name,
                description: serviceData.description,
                category: serviceData.category,
                price: serviceData.price.toString(),
                duration: serviceData.duration,
                image: serviceData.image,
                isActive: true,
            };
            const [insertResult] = await database_1.db.insert(service_1.services).values(newServiceData);
            const [createdService] = await database_1.db
                .select()
                .from(service_1.services)
                .where((0, drizzle_orm_1.eq)(service_1.services.id, insertResult.insertId.toString()))
                .limit(1);
            if (!createdService) {
                throw new errorHandler_1.DatabaseError("Failed to create service");
            }
            return createdService;
        }
        catch (error) {
            if (error instanceof errorHandler_1.ConflictError || error instanceof errorHandler_1.BadRequestError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to create service");
        }
    }
    async updateService(id, updateData) {
        try {
            const existingService = await this.getServiceById(id);
            if (updateData.name && updateData.name !== existingService.name) {
                const [nameConflict] = await database_1.db
                    .select()
                    .from(service_1.services)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(service_1.services.name, updateData.name), (0, drizzle_orm_1.eq)(service_1.services.id, id)))
                    .limit(1);
                if (nameConflict) {
                    throw new errorHandler_1.ConflictError("Service with this name already exists");
                }
            }
            if (updateData.price !== undefined && updateData.price <= 0) {
                throw new errorHandler_1.BadRequestError("Service price must be greater than 0");
            }
            if (updateData.duration !== undefined && updateData.duration <= 0) {
                throw new errorHandler_1.BadRequestError("Service duration must be greater than 0");
            }
            const updateFields = {
                ...updateData,
                price: updateData.price?.toString(),
                updatedAt: new Date(),
            };
            await database_1.db.update(service_1.services).set(updateFields).where((0, drizzle_orm_1.eq)(service_1.services.id, id));
            const updatedService = await this.getServiceById(id);
            return updatedService;
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError ||
                error instanceof errorHandler_1.ConflictError ||
                error instanceof errorHandler_1.BadRequestError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to update service");
        }
    }
    async deleteService(id) {
        try {
            await this.getServiceById(id);
            await database_1.db.delete(service_1.services).where((0, drizzle_orm_1.eq)(service_1.services.id, id));
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to delete service");
        }
    }
    async toggleServiceStatus(id) {
        try {
            const service = await this.getServiceById(id);
            await database_1.db
                .update(service_1.services)
                .set({
                isActive: !service.isActive,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(service_1.services.id, id));
            return await this.getServiceById(id);
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to toggle service status");
        }
    }
    async getServicesByCategory(category) {
        try {
            return await database_1.db
                .select()
                .from(service_1.services)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(service_1.services.category, category), (0, drizzle_orm_1.eq)(service_1.services.isActive, true)))
                .orderBy((0, drizzle_orm_1.asc)(service_1.services.name));
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to fetch services by category");
        }
    }
    async searchServices(query, limit = 10) {
        try {
            return await database_1.db
                .select()
                .from(service_1.services)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(service_1.services.name, `%${query}%`), (0, drizzle_orm_1.like)(service_1.services.description, `%${query}%`)), (0, drizzle_orm_1.eq)(service_1.services.isActive, true)))
                .orderBy((0, drizzle_orm_1.asc)(service_1.services.name))
                .limit(limit);
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to search services");
        }
    }
    async getServiceStats() {
        try {
            const [totalResult] = await database_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(service_1.services);
            const [activeResult] = await database_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(service_1.services)
                .where((0, drizzle_orm_1.eq)(service_1.services.isActive, true));
            const categoryStats = await database_1.db
                .select({
                category: service_1.services.category,
                count: (0, drizzle_orm_1.count)(),
            })
                .from(service_1.services)
                .where((0, drizzle_orm_1.eq)(service_1.services.isActive, true))
                .groupBy(service_1.services.category);
            const servicesByCategory = categoryStats.reduce((acc, stat) => {
                acc[stat.category] = stat.count;
                return acc;
            }, {});
            const activeServices = await database_1.db
                .select()
                .from(service_1.services)
                .where((0, drizzle_orm_1.eq)(service_1.services.isActive, true));
            const averagePrice = activeServices.length > 0
                ? activeServices.reduce((sum, service) => sum + parseFloat(service.price), 0) / activeServices.length
                : 0;
            const averageDuration = activeServices.length > 0
                ? activeServices.reduce((sum, service) => sum + service.duration, 0) /
                    activeServices.length
                : 0;
            return {
                totalServices: totalResult.count,
                activeServices: activeResult.count,
                servicesByCategory,
                averagePrice: Math.round(averagePrice * 100) / 100,
                averageDuration: Math.round(averageDuration),
            };
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to get service statistics");
        }
    }
    async getPopularServices(limit = 5) {
        try {
            return await database_1.db
                .select()
                .from(service_1.services)
                .where((0, drizzle_orm_1.eq)(service_1.services.isActive, true))
                .orderBy((0, drizzle_orm_1.desc)(service_1.services.createdAt))
                .limit(limit);
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to get popular services");
        }
    }
}
exports.default = new ServiceService();
//# sourceMappingURL=serviceService.js.map