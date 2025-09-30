const router = require("express").Router();
const { LoginRequest } = require("@/Requests/UserRequest");

const { login, getAuthUser, logout } = require("@/Controllers/AuthController");

router.post("/login", LoginRequest.middleware(), login);
router.get("/user", getAuthUser);
router.post("/logout", logout);

module.exports = router;
