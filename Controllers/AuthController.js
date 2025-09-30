const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("@/Models/User");
const tokenBlacklist = require("@/utils/tokenBlacklist");

const createAccessToken = (user) => {
  return jwt.sign(
    { username: user.username, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "9h",
    },
  );
};
const createRefreshToken = (user) => {
  return jwt.sign(
    { username: user.username, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: "Invalid password" });

  const accessToken = createAccessToken(user);

  return res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    token: accessToken,
  });
};

const verifyJWT = (req, res, callback) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res
      .status(401)
      .json({ message: "No authorization header provided" });
  }

  const token = authorization.split(" ")[1]; // Bearer token
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Check if token is blacklisted
  if (tokenBlacklist.isTokenBlacklisted(token)) {
    return res.status(401).json({ message: "Token has been invalidated" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Find user by email from decoded token
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.token = token;
    req.tokenExp = decoded.exp;

    callback();
  });
};

const getAuthUser = (req, res) => {
  verifyJWT(req, res, () => {
    const user = req.user;
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  });
};

const logout = (req, res) => {
  verifyJWT(req, res, () => {
    const { token, tokenExp } = req;
    // Add token to blacklist with its expiration time
    tokenBlacklist.addToken(token, tokenExp);

    return res.status(200).json({
      status: "success",
      message: "Logout successful. Token has been invalidated.",
    });
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  login,
  getAuthUser,
  logout,
};
