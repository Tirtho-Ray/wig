
# Application Port
PORT=9000

DATABASE_URL=postgresql://uillgus:mypassword@localhost:5430/uillgus_db
POSTGRES_USER=uillgus
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=uillgus_db

NODE_ENV=development

BCRYPT_SALT_ROUNDS=12

JWT_ACCESS_SECRET=super_long_random_access_secret
JWT_ACCESS_EXPIRES_IN=10m

JWT_REFRESH_SECRET=super_long_random_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_TOKEN_TTL_DAYS=7


JWT_ISSUER=my-user
JWT_AUDIENCE=my_user




REDIS_HOST=localhost
REDIS_PORT=6375
REDIS_URL=redis://localhost:6375


ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
SMTP_FROM=

