import express, { Application } from "express";
import cors from "cors";
import path from "path";
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
import stylistRoutes from "./routes/stylists";
import serviceRoutes from "./routes/services";
import bookingRoutes from "./routes/bookings";
import paymentRoutes from "./routes/payments";
import dashboardRoutes from "./routes/dashboard";
import uploadRoutes from "./routes/upload";

// Load environment variables
dotenv.config();

class App {
  public app: Application;
  public port: string | number;
  public basePath: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    // /barber for cPanel hosting at public_html/barber
    this.basePath = process.env.BASE_PATH || "/barber";
    
    console.log(`🔧 BASE_PATH configured as: "${this.basePath}"`);

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Trust proxy
    this.app.set("trust proxy", 1);

    // CORS configuration
    const allowedOrigins = [
      "http://localhost:8081",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://192.168.1.32:8081",
      "http://192.168.1.32:19000",
      "http://192.168.1.32:19006",
      // Production URLs
      "https://asessment24.site",
      "https://admin.asessment24.site",
      "https://barber-admin.asessment24.site",
    ];

    const corsOptions = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }
        
        // In development, allow all origins
        if (process.env.NODE_ENV === "development") {
          return callback(null, true);
        }
        
        // In production, check against allowed origins or allow if from same domain
        if (allowedOrigins.includes(origin) || origin.includes("asessment24.site")) {
          return callback(null, true);
        }
        
        callback(new Error("Not allowed by CORS"));
      },
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
    this.app.get(`${this.basePath}/health`, (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
      });
    });

    // Health check endpoint for v1 API
    this.app.get(`${this.basePath}/api/v1/health`, (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
      });
    });

    // API documentation endpoint
    this.app.get(`${this.basePath}/`, (req, res) => {
      res.json({
        name: "Rusdi Barber API",
        version: "1.0.0",
        description: "Barber shop booking and management system API",
        endpoints: {
          health: `${this.basePath}/health`,
          auth: `${this.basePath}/api/v1/auth`,
          users: `${this.basePath}/api/v1/users`,
          stylists: `${this.basePath}/api/v1/stylists`,
          services: `${this.basePath}/api/v1/services`,
          bookings: `${this.basePath}/api/v1/bookings`,
          payments: `${this.basePath}/api/v1/payments`,
          reviews: `${this.basePath}/api/v1/reviews`,
          notifications: `${this.basePath}/api/v1/notifications`,
          dashboard: `${this.basePath}/api/v1/dashboard`,
        },
        documentation: {
          message: "API documentation will be available soon",
          swagger: `${this.basePath}/api/docs`,
        },
      });
    });
  }

  private initializeRoutes(): void {
    const apiPrefix = `${this.basePath}/api/v1`;

    // Authentication routes
    this.app.use(`${apiPrefix}/auth`, authRoutes);

    // User routes
    this.app.use(`${apiPrefix}/users`, userRoutes);

    // Stylist routes
    this.app.use(`${apiPrefix}/stylists`, stylistRoutes);

    // Service routes
    this.app.use(`${apiPrefix}/services`, serviceRoutes);

    // Booking routes
    this.app.use(`${apiPrefix}/bookings`, bookingRoutes);

    // Payment routes
    this.app.use(`${apiPrefix}/payments`, paymentRoutes);

    // Dashboard routes
    this.app.use(`${apiPrefix}/dashboard`, dashboardRoutes);

    // Upload routes
    this.app.use(`${apiPrefix}/upload`, uploadRoutes);

    // Serve uploaded files statically
    this.app.use(
      `${this.basePath}/uploads`,
      express.static(path.join(__dirname, "../uploads"))
    );

    // TODO: Add other routes here as they are created
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
