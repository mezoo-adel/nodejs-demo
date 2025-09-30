require("module-alias/register");
const express = require("express");
const authorizedMiddleware = require("@/middleware/authMiddleware");
const {
  StoreUserRequest,
  UpdateUserRequest,
} = require("@/Requests/UserRequest");

const route = express();
const {
  index,
  show,
  create,
  update,
  destroy,
} = require("@/Controllers/UserController");

// Public routes
route.post("/", StoreUserRequest.middleware(), create);

// Protected routes
route
  .use(authorizedMiddleware)
  .get("/", index)
  .get("/:username", show)
  .put("/:username", UpdateUserRequest.middleware(), update)
  .delete("/:username", destroy);

module.exports = route;
