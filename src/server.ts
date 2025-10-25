import App from './app';

async function startServer(): Promise<void> {
  try {
    const app = new App();

    // Initialize the application
    await app.initialize();

    // Start listening for requests
    app.listen();

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
