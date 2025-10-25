import DatabaseSeeder from "./index";
import { testConnection, closeConnection } from "../config/database";

async function runSeeders() {
  console.log("🚀 Rusdi Barber Database Seeder");
  console.log("================================");

  try {
    // Test database connection
    console.log("🔍 Testing database connection...");
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error("❌ Database connection failed. Please check your configuration.");
      process.exit(1);
    }

    // Parse command line arguments
    const args = process.argv.slice(2);
    const shouldClear = args.includes("--clear") || args.includes("-c");
    const shouldSkipConfirmation = args.includes("--yes") || args.includes("-y");

    if (shouldClear) {
      if (!shouldSkipConfirmation) {
        console.log("⚠️ WARNING: This will delete all existing data!");
        console.log("Are you sure you want to continue? (y/N)");

        // Simple confirmation prompt
        const confirmation = await new Promise<string>((resolve) => {
          process.stdin.once("data", (data) => {
            resolve(data.toString().trim().toLowerCase());
          });
        });

        if (confirmation !== "y" && confirmation !== "yes") {
          console.log("❌ Operation cancelled by user.");
          process.exit(0);
        }
      }

      console.log("🗑️ Clearing existing data...");
      await DatabaseSeeder.clearAll();
      console.log("");
    }

    // Run all seeders
    await DatabaseSeeder.runAll();

    console.log("🎉 Database seeding completed successfully!");
    console.log("");
    console.log("💡 Next steps:");
    console.log("   1. Start the development server: npm run dev");
    console.log("   2. Test login with the provided credentials");
    console.log("   3. Explore the API endpoints");

  } catch (error) {
    console.error("❌ Seeding failed:");
    console.error(error);
    process.exit(1);
  } finally {
    // Close database connection
    await closeConnection();
    process.exit(0);
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n🛑 Process interrupted. Closing database connection...");
  await closeConnection();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Process terminated. Closing database connection...");
  await closeConnection();
  process.exit(0);
});

// Show help message
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("Rusdi Barber Database Seeder");
  console.log("");
  console.log("Usage:");
  console.log("  npm run seed              # Run seeders with existing data");
  console.log("  npm run seed --clear      # Clear existing data and run seeders");
  console.log("  npm run seed --clear -y   # Clear and seed without confirmation");
  console.log("");
  console.log("Options:");
  console.log("  --clear, -c    Clear all existing data before seeding");
  console.log("  --yes, -y      Skip confirmation prompts");
  console.log("  --help, -h     Show this help message");
  console.log("");
  process.exit(0);
}

// Run the seeder
runSeeders();
