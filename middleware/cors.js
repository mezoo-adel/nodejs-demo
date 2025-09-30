// Define allowed origins - only these domains can access your API
const cors = require("cors");
const allowedOrigins = ["https://www.youtube.com"];

const corsOptions = {
  origin: function (origin, callback) {
    // Check if the origin is in our allowed list OR requests with no origin (like mobile apps, Postman, curl)
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(
        new Error(`❌ CORS policy violation: Origin ${origin} is not allowed`),
      );
    }
  },
  optionsSuccessStatus: 200, // For legacy browser support
};

// Export the configured CORS middleware
module.exports = cors(corsOptions);
