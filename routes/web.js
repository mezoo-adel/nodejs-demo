const express = require("express");
const router = express.Router();
const { fullPath } = require("@/utils/fileHelpers");

// Helper function to render pages with layout
const renderPage = (res, view, data = {}) => {
  res.sendFile(fullPath(view) + ".html");
};

/**
 * Home page with route listing
 * Example: GET /
 */
router.get("/", (req, res) => {
  renderPage(res, "views/index");
});

/**
 * Simple HTML page without CSS
 * Example: GET /simple
 */
router.get("/simple", (req, res) => {
  renderPage(res, "views/simple");
});

/**
 * HTML page with inline CSS (no external files)
 * Example: GET /inline-css
 */
router.get("/inline-css", (req, res) => {
  renderPage(res, "views/inline-css");
});

/**
 * Route chaining for web pages
 * Example: GET /chain
 */
router.get("/chain", [
  // Step 1: Generate page data
  (req, res, next) => {
    console.log(" Step 1: Generating page data");
    req.pageData = {
      title: "Chained Web Page",
      sections: [
        {
          title: "Introduction",
          content: "This page was built using route chaining.",
        },
        {
          title: "Processing",
          content: "Data is processed in multiple steps.",
        },
        { title: "Rendering", content: "Final HTML is generated dynamically." },
      ],
      generatedAt: new Date().toISOString(),
    };
    next();
  },
  // Step 2: Process data
  (req, res, next) => {
    console.log(" Step 2: Processing data");
    // Add any additional processing here
    next();
  },
  // Step 3: Render the page
  (req, res) => {
    console.log(" Step 3: Rendering template");
    renderPage(res, "views/chain");
  },
]);

/**
 * Dynamic page with parameters
 * Example: GET /dynamic/1
 */
router.get("/dynamic/:id", (req, res) => {
  renderPage(res, "views/dynamic");
});

module.exports = router;
