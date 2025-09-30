const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const tokenBlacklist = require("@/utils/tokenBlacklist");

const authorized = (req, res, next) => {
  const { authorization } = req.headers;
  
  if (!authorization) {
    return res.status(401).json({ message: "No authorization header provided" });
  }

  const token = authorization.split(" ")[1]; // Bearer token
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Check if token is blacklisted
  if (tokenBlacklist.isTokenBlacklisted(token)) {
    return res.status(401).json({ message: "Token has been invalidated" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    req.user = decoded;
    req.token = token;
    req.tokenExp = decoded.exp;
    next();
  });
};

module.exports = authorized;
