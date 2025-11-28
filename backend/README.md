# Geekspot Backend API

E-commerce backend for Geekspot tech shop built with Node.js, Express, and MongoDB.

## Features

- ✅ User authentication (Email/Password + Google OAuth)
- ✅ JWT-based authorization with refresh tokens
- ✅ Role-based access control (User, Admin, Manager)
- ✅ Product management with category-specific specs
- ✅ Order management with manual payment verification
- ✅ File upload support (Cloudflare R2)
- ✅ MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT + Passport.js (Google OAuth)
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Validation**: express-validator

## Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

## Environment Variables

See `.env.example` for all required variables. Key variables:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key (auto-generated)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret (optional)
- `R2_*` - Cloudflare R2 credentials (optional)

## Running the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/google` - Google OAuth (when configured)

### Health Check
- `GET /health` - Server health status
- `GET /` - API information

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose models
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Database Models

- **User** - User accounts with authentication
- **Product** - Product catalog with specs
- **Order** - Orders with payment verification
- **Category** - Product categories

## Development

```bash
# Run in development mode
npm run dev

# The server will auto-restart on file changes
```

## Testing

Use Postman, Thunder Client, or curl to test endpoints:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Next Steps

1. ✅ Basic authentication setup complete
2. ⏳ Add product endpoints
3. ⏳ Add order endpoints
4. ⏳ Configure Google OAuth
5. ⏳ Set up Cloudflare R2

## License

ISC
