// Simple in-memory token blacklist
// In production, use Redis or another persistent store
class TokenBlacklist {
  constructor() {
    this.blacklistedTokens = new Set();
    // Clean up expired tokens every hour
    setInterval(() => this.cleanupExpiredTokens(), 60 * 60 * 1000);
  }

  /**
   * Add a token to the blacklist
   * @param {string} token - JWT token to blacklist
   * @param {number} exp - Token expiration timestamp
   */
  addToken(token, exp) {
    this.blacklistedTokens.add(JSON.stringify({ token, exp }));
  }

  /**
   * Check if a token is blacklisted
   * @param {string} token - JWT token to check
   * @returns {boolean} - True if token is blacklisted
   */
  isTokenBlacklisted(token) {
    // Check if token exists in blacklist
    for (const item of this.blacklistedTokens) {
      const { token: blacklistedToken, exp } = JSON.parse(item);
      
      // Remove expired tokens during check
      if (Date.now() >= exp * 1000) {
        this.blacklistedTokens.delete(item);
        continue;
      }
      
      if (blacklistedToken === token) {
        return true;
      }
    }
    return false;
  }

  /**
   * Clean up expired tokens from blacklist
   */
  cleanupExpiredTokens() {
    const now = Date.now();
    for (const item of this.blacklistedTokens) {
      const { exp } = JSON.parse(item);
      if (now >= exp * 1000) {
        this.blacklistedTokens.delete(item);
      }
    }
  }

  /**
   * Get the number of blacklisted tokens (for debugging)
   */
  getBlacklistSize() {
    return this.blacklistedTokens.size;
  }
}

// Export a singleton instance
module.exports = new TokenBlacklist();
