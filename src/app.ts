import express, { Application } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { testConnection } from "./config/database";
import {
  errorHandler,
  notFoundHandler,
  gracefulShutdown,
} from "./middleware/errorHandler";

// Import routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import bookingRoutes from "./routes/bookings";
import paymentRoutes from "./routes/payments";
import dashboardRoutes from "./routes/dashboard";

// Load environment variables
dotenv.config();

class App {
  public app: Application;
  public port: string | number;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Trust proxy
    this.app.set("trust proxy", 1);

    // CORS configuration
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || ["http://localhost:5173"],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "Cache-Control",
        "Pragma",
      ],
    };

    this.app.use(cors(corsOptions));

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Security headers
    this.app.use((req, res, next) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      next();
    });

    // Request logging middleware
    if (process.env.NODE_ENV === "development") {
      this.app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
      });
    });

    // Health check endpoint for v1 API
    this.app.get("/api/v1/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
      });
    });

    // API documentation endpoint
    this.app.get("/", (req, res) => {
      res.json({
        name: "Rusdi Barber API",
        version: "1.0.0",
        description: "Barber shop booking and management system API",
        endpoints: {
          health: "/health",
          auth: "/api/v1/auth",
          users: "/api/v1/users",
          stylists: "/api/v1/stylists",
          services: "/api/v1/services",
          bookings: "/api/v1/bookings",
          payments: "/api/v1/payments",
          reviews: "/api/v1/reviews",
          notifications: "/api/v1/notifications",
          dashboard: "/api/v1/dashboard",
        },
        documentation: {
          message: "API documentation will be available soon",
          swagger: "/api/docs",
        },
      });
    });
  }

  private initializeRoutes(): void {
    const apiPrefix = "/api/v1";

    // Authentication routes
    this.app.use(`${apiPrefix}/auth`, authRoutes);

    // User routes
    this.app.use(`${apiPrefix}/users`, userRoutes);

    // Booking routes
    this.app.use(`${apiPrefix}/bookings`, bookingRoutes);

    // Payment routes
    this.app.use(`${apiPrefix}/payments`, paymentRoutes);

    // Dashboard routes
    this.app.use(`${apiPrefix}/dashboard`, dashboardRoutes);

    // TODO: Add other routes here as they are created
    // this.app.use(`${apiPrefix}/stylists`, stylistRoutes);
    // this.app.use(`${apiPrefix}/services`, serviceRoutes);
    // this.app.use(`${apiPrefix}/reviews`, reviewRoutes);
    // this.app.use(`${apiPrefix}/notifications`, notificationRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler for undefined routes
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async initialize(): Promise<void> {
    try {
      // Test database connection
      const dbConnected = await testConnection();
      if (!dbConnected) {
        console.error("❌ Failed to connect to database");
        process.exit(1);
      }

      console.log("✅ Application initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize application:", error);
      process.exit(1);
    }
  }

  public listen(): void {
    const server = this.app.listen(this.port, () => {
      console.log(`🚀 Server running on port ${this.port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📖 API Documentation: http://localhost:${this.port}`);
      console.log(`❤️  Health Check: http://localhost:${this.port}/health`);
    });

    // Setup graceful shutdown
    gracefulShutdown(server);

    // Handle server errors
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.syscall !== "listen") {
        throw error;
      }

      const bind =
        typeof this.port === "string"
          ? "Pipe " + this.port
          : "Port " + this.port;

      switch (error.code) {
        case "EACCES":
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          console.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  }
}

export default App;
