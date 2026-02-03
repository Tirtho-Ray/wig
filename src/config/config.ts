export default () => ({
  port: parseInt(process.env.PORT as string, 10) || 9000,
  node_env: process.env.NODE_ENV,
  bcrypt_salt_rounds: parseInt(process.env.BCRYPT_SALT_ROUNDS as string, 10) || 12,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  refresh_token_ttl_days: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS as string, 10) || 7,
});