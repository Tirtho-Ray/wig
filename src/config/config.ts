export default () => ({
  port: parseInt(process.env.PORT || '9000', 10),
  node_env: process.env.NODE_ENV || 'development',
  
  security: {
    bcrypt_salt_rounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },

  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    refresh_ttl_days: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '7', 10),
    
    issuer: process.env.JWT_ISSUER || 'willgus_auth_service',
    audience: process.env.JWT_AUDIENCE || 'willgus_web_client',
  },
});