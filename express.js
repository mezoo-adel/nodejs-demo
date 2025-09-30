require("dotenv/config");
require("module-alias/register");
const express = require("express");
const webRoutes = require("@/routes/web");
const apiRoutes = require("@/routes/api");
const corsMiddleware = require("@/middleware/cors");
const loggerMiddleware = require("@/middleware/logger");
const connectDB = require("@/config/dbConenct");
const mongoose = require("mongoose");

connectDB();
const app = express();
const PORT = process.env.NODE_PORT || 3000;

// ============================================================================
// GLOBAL MIDDLEWARE (Applied to ALL requests)
// Order matters! Apply in this sequence:
// 1. Security & CORS (first)
// 2. Logging & monitoring
// 3. Body parsing
// 4. Static file serving
// 5. Routes
// 6. Error handling (last)
// ============================================================================

// 1. SECURITY & CORS MIDDLEWARE (Must be FIRST!) and it takes 3 arguments
app.use((req, res, next) => corsMiddleware(req, res, next));

// 2. LOGGING MIDDLEWARE (Early to capture all requests)
app.use((req, res, next) => loggerMiddleware(req, res, next));

// 3. BODY PARSING MIDDLEWARE
// Parse JSON requests (for APIs)
app.use(express.json());
// Parse URL-encoded form data (for HTML forms)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 4. STATIC FILE SERVING
// Serve static files from public directory (CSS, JS, images)
app.use(express.static("public"));

// ============================================================================
// ROUTE MOUNTING
// ============================================================================

// Mount web routes (HTML pages, no API prefix)
app.use("/", webRoutes);

// Mount API routes (JSON APIs, with /api prefix)
app.use("/api", apiRoutes);

// ============================================================================
// ERROR HANDLING MIDDLEWARE (Must be LAST!)
// ============================================================================

// 404 handler - must be the very last middleware
app.use((req, res) => {
  // Check if it's an API request (starts with /api)
  if (req.path.startsWith("/api")) {
    res.status(404).json({
      error: "Not Found",
      message: `API endpoint ${req.method} ${req.path} not found`,
    });
  } else {
    // Root level 404 - serve the 404 HTML page
    res.status(404).sendFile(fullPath("views", "404.html"));
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

mongoose.connection.on("error", (error) => console.error(error));
mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🌐 Available endpoints:`);
    console.log(`   📄 Web Routes: http://localhost:${PORT}/`);
    console.log(`   🔗 API Routes: http://localhost:${PORT}/api/`);
  });
});
