/**
 * Route Definitions
 * This file contains all your API routes and their handlers
 * Middlewares should NOT be defined here - they belong in express.js
 */

const express = require("express");
const router = express.Router(); // Use Router instead of app for better organization

// Use the imported routes
router.use("/users", require("./users"));
router.use("/auth", require("./auth.js"));

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * Home route - serves the main index page
 */
router.get("/", (req, res) => {
  res.send("Hello World! INDEX - Welcome to your API");
});

/**
 * API test endpoint for CORS testing
 * Example: GET /test
 */
router.get("/test", (req, res) => {
  res.json({
    message: "CORS test successful!",
    origin: req.get("Origin") || "No origin header",
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
  });
});

// ============================================================================
// API ROUTES (Organize by feature)
// ============================================================================

/**
 * Health check endpoint
 * Useful for monitoring and debugging
 */
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

/**
 * Route chaining examples
 * Demonstrates how to chain multiple handlers
 */
router.get("/chain", [
  // First handler - logs and calls next()
  (req, res, next) => {
    console.log("Chain 1 - Processing request");
    next(); // Pass to next handler
  },
  // Second handler - sends response
  (req, res) => {
    console.log("Chain 2 - Sending response");
    res.send("GOOOOOOOOO - Route chaining successful!");
  },
]);

/**
 * Route chaining with separate functions
 * More readable way to organize complex routes
 */
function one(req, res, next) {
  console.log("Route chain 2 - Step 1");
  next();
}

function two(req, res, next) {
  console.log("Route chain 2 - Step 2");
  next();
}

function three(req, res) {
  console.log("Route chain 2 - Step 3 - Final");
  res.send("CHAINING DONE - Multi-step route completed!");
}

// Apply the chain
router.get("/chain2", [one, two, three]);

// ============================================================================
// DYNAMIC ROUTE EXAMPLES
// ============================================================================

/**
 * Dynamic route with multiple parameters
 * Example: GET /posts/123/comments/456
 */
router.get("/posts/:postId/comments/:commentId", (req, res) => {
  res.json({
    postId: req.params.postId,
    commentId: req.params.commentId,
    message: `Comment ${req.params.commentId} from post ${req.params.postId}`,
  });
});

/**
 * Query parameter example
 * Example: GET /search?q=javascript&page=2
 */
router.get("/search", (req, res) => {
  const { q, page, limit } = req.query;
  res.json({
    query: q || "No query provided",
    page: page || 1,
    limit: limit || 10,
    results: `Search results for "${q}" (page ${page}, limit ${limit})`,
  });
});
 
module.exports = router;
