/**
 * Auth Configuration
 * Reads from environment variables
 */
export const getAuthConfig = () => {
  return {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  };
};

