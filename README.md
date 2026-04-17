# URL Shortener API

## Overview
A production-style URL shortener service built with a backend-first approach.  
It supports generating short links, redirecting users, tracking analytics, and handling performance and abuse concerns through caching and rate limiting.

This project focuses on clean architecture, scalability, and real-world backend patterns rather than just functionality.

---

## Tech Stack

- **Node.js**
- **TypeScript**
- **Express**
- **PostgreSQL**
- **Redis**
- **Docker (optional for Redis)**
- **node-postgres (pg)**

---

## Features

### Core Functionality
- Create short URLs
- Redirect to original URLs
- Track click counts
- Expiration support for links

### Performance & Scalability
- Redis caching (read-through cache)
- Optimized database queries with indexing

### Security & Reliability
- Rate limiting (per IP)
- Input validation
- Centralized error handling
- Graceful cache failure handling

### Architecture
- Controller / Service separation
- Custom error handling (`AppError`)
- Middleware-driven design

---

## API Endpoints

### Create Short URL
POST /shorten

Request Body:
{
  "url": "https://example.com",
  "expiresInDays": 7
}

Response:
{
  "shortUrl": "http://localhost:3000/abc123"
}

---

### Redirect to Original URL
GET /:code

- Redirects to the original URL
- Returns:
  - 404 if not found
  - 410 if expired

---

### Get URL Stats
GET /stats/:code

Response:
{
  "originalUrl": "...",
  "shortCode": "...",
  "clickCount": 42,
  "createdAt": "...",
  "expiresAt": "...",
  "isExpired": false
}

---

## Project Structure

src/
  controllers/     -> request/response handling
  services/        -> business logic
  routes/          -> route definitions
  middleware/      -> rate limiter, error handler
  utils/           -> helpers (cache, AppError, generators)
  config/          -> Redis + environment config & db connection
  app.ts           -> express setup
  server.ts        -> server entry point

---

## How It Works

### URL Creation Flow
1. Validate input URL
2. Generate unique short code
3. Check for collisions
4. Store in PostgreSQL
5. Return shortened URL

---

### Redirect Flow
1. Check Redis cache
2. If cache miss → query database
3. Increment click count
4. Check expiration
5. Redirect to original URL
6. Cache result for future requests

---

### Caching Strategy
- Read-through cache using Redis
- TTL-based expiration (5 minutes)
- Cache key format: `url:{shortCode}`
- Cache failure does not break application

---

### Rate Limiting
- In-memory rate limiter (per IP)
- Prevents abuse of URL creation endpoint
- Configurable window and request limits

---

## Environment Variables

Create a `.env` file:

PORT=3000
DATABASE_URL=your_database_url
REDIS_URL=redis://localhost:6379

---

## Running the Project

### 1. Install dependencies
npm install

### 2. Start PostgreSQL
Ensure your database is running and accessible

### 3. Start Redis
Using Docker:
docker run -d -p 6379:6379 redis

### 4. Run the server
npm run dev

---

## Design Decisions

### Why Redis?
- Reduces database load
- Improves response time for high-read endpoints

### Why Random Short Codes?
- Avoids predictability
- Prevents enumeration attacks
- Simple and efficient with collision checks

### Why Centralized Error Handling?
- Consistent API responses
- Cleaner controllers and services
- Easier debugging and maintenance

---

## Limitations

- In-memory rate limiter does not scale across multiple instances
- Cache invalidation is basic (TTL-based only)
- No user authentication or ownership of links

---

## Future Improvements

- Distributed rate limiting using Redis
- Custom short codes
- User accounts and link ownership
- Analytics dashboard (time-series tracking)
- Horizontal scaling support

---

## What This Project Demonstrates

- Backend system design fundamentals
- API architecture and separation of concerns
- Performance optimization (caching)
- Handling real-world edge cases
- Writing maintainable and scalable code

---

## Author Notes

This project was built to reflect how real backend systems are designed:
not just to function, but to scale, handle failure, and remain maintainable.

*/
